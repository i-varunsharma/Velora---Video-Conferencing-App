'use client';

import { useRef, useCallback, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useMeetingStore } from '@/store/meeting.store';

// ─── Types ──────────────────────────────────────────────

interface PeerInfo {
  socketId: string;
  userId: string;
  userName: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
}

interface RTCConfig {
  iceServers: RTCIceServer[];
}

// ─── STUN/TURN Configuration ────────────────────────────

const rtcConfig: RTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

/**
 * useWebRTC — Core hook that manages all WebRTC peer connections.
 *
 * Flow:
 * 1. On join → receive room-users → create offers to each existing peer
 * 2. On user-joined → wait for their offer
 * 3. On offer → create answer
 * 4. On answer → set remote description
 * 5. On ice-candidate → add ICE candidate
 * 6. On track → store remote stream in Zustand
 */
export function useWebRTC(socket: Socket | null, meetingCode: string | null) {
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const {
    addPeer,
    removePeer,
    updatePeerAudio,
    updatePeerVideo,
    updatePeerScreenShare,
  } = useMeetingStore();

  /**
   * Creates a new RTCPeerConnection for a remote peer.
   */
  const createPeerConnection = useCallback(
    (remoteSocketId: string, remoteName: string): RTCPeerConnection => {
      // Close existing connection if any
      const existing = peerConnections.current.get(remoteSocketId);
      if (existing) {
        existing.close();
      }

      const pc = new RTCPeerConnection(rtcConfig);
      peerConnections.current.set(remoteSocketId, pc);

      // Add local tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle incoming remote tracks
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          addPeer(remoteSocketId, remoteStream, remoteName);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice-candidate', {
            targetId: remoteSocketId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.warn(`Peer connection ${remoteSocketId} state: ${pc.connectionState}`);
        }
        if (pc.connectionState === 'closed') {
          peerConnections.current.delete(remoteSocketId);
        }
      };

      // Handle ICE connection state
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') {
          console.warn(`ICE connection failed for ${remoteSocketId}, attempting restart`);
          pc.restartIce();
        }
      };

      // Process any pending ICE candidates
      const pending = pendingCandidates.current.get(remoteSocketId);
      if (pending) {
        pending.forEach((candidate) => {
          pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
        });
        pendingCandidates.current.delete(remoteSocketId);
      }

      return pc;
    },
    [socket, addPeer]
  );

  /**
   * Creates and sends an SDP offer to a remote peer.
   */
  const createOffer = useCallback(
    async (remoteSocketId: string, remoteName: string) => {
      if (!socket) return;

      const pc = createPeerConnection(remoteSocketId, remoteName);

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);

        socket.emit('offer', {
          targetId: remoteSocketId,
          sdp: pc.localDescription!,
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    },
    [socket, createPeerConnection]
  );

  /**
   * Handles an incoming SDP offer and sends back an answer.
   */
  const handleOffer = useCallback(
    async (senderId: string, sdp: RTCSessionDescriptionInit, senderName: string) => {
      if (!socket) return;

      const pc = createPeerConnection(senderId, senderName);

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', {
          targetId: senderId,
          sdp: pc.localDescription!,
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    },
    [socket, createPeerConnection]
  );

  /**
   * Handles an incoming SDP answer.
   */
  const handleAnswer = useCallback(
    async (senderId: string, sdp: RTCSessionDescriptionInit) => {
      const pc = peerConnections.current.get(senderId);
      if (!pc) return;

      try {
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    },
    []
  );

  /**
   * Handles an incoming ICE candidate.
   */
  const handleIceCandidate = useCallback(
    async (senderId: string, candidate: RTCIceCandidateInit) => {
      const pc = peerConnections.current.get(senderId);

      if (!pc || !pc.remoteDescription) {
        // Queue candidate if connection isn't ready yet
        if (!pendingCandidates.current.has(senderId)) {
          pendingCandidates.current.set(senderId, []);
        }
        pendingCandidates.current.get(senderId)!.push(candidate);
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    },
    []
  );

  /**
   * Replaces the video track in all peer connections (for screen share).
   */
  const replaceVideoTrack = useCallback(
    (newTrack: MediaStreamTrack) => {
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(newTrack).catch(console.error);
        }
      });
    },
    []
  );

  /**
   * Closes all peer connections and cleans up.
   */
  const closeAllConnections = useCallback(() => {
    peerConnections.current.forEach((pc, socketId) => {
      pc.close();
      removePeer(socketId);
    });
    peerConnections.current.clear();
    pendingCandidates.current.clear();
  }, [removePeer]);

  /**
   * Sets the local stream reference for peer connections.
   */
  const setLocalStream = useCallback((stream: MediaStream | null) => {
    localStreamRef.current = stream;
  }, []);

  // ─── Socket Event Listeners ─────────────────────────

  useEffect(() => {
    if (!socket || !meetingCode) return;

    // When receiving the list of existing room users, create offers to each
    const onRoomUsers = (users: PeerInfo[]) => {
      users.forEach((user) => {
        createOffer(user.socketId, user.userName);
      });
    };

    // When a new user joins, we wait for THEIR offer (they are the polite peer)
    // Actually, following our protocol: existing users create offers to new users
    const onUserJoined = (peer: PeerInfo) => {
      createOffer(peer.socketId, peer.userName);
    };

    // When a user leaves
    const onUserLeft = (data: { userId: string; socketId: string }) => {
      const pc = peerConnections.current.get(data.socketId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(data.socketId);
      }
      pendingCandidates.current.delete(data.socketId);
      removePeer(data.socketId);
    };

    // Forward SDP offer
    const onOffer = (data: { senderId: string; sdp: RTCSessionDescriptionInit }) => {
      // Find sender name from store or use a fallback
      handleOffer(data.senderId, data.sdp, 'Peer');
    };

    // Forward SDP answer
    const onAnswer = (data: { senderId: string; sdp: RTCSessionDescriptionInit }) => {
      handleAnswer(data.senderId, data.sdp);
    };

    // Forward ICE candidate
    const onIceCandidate = (data: { senderId: string; candidate: RTCIceCandidateInit }) => {
      handleIceCandidate(data.senderId, data.candidate);
    };

    // Media state events
    const onPeerAudioToggled = (data: { userId: string; enabled: boolean }) => {
      // Find socketId by userId — we search through peers
      peerConnections.current.forEach((_pc, socketId) => {
        const peerState = useMeetingStore.getState().peers.get(socketId);
        if (peerState) {
          updatePeerAudio(socketId, data.enabled);
        }
      });
    };

    const onPeerVideoToggled = (data: { userId: string; enabled: boolean }) => {
      peerConnections.current.forEach((_pc, socketId) => {
        const peerState = useMeetingStore.getState().peers.get(socketId);
        if (peerState) {
          updatePeerVideo(socketId, data.enabled);
        }
      });
    };

    const onPeerScreenShareStarted = (data: { userId: string }) => {
      peerConnections.current.forEach((_pc, socketId) => {
        const peerState = useMeetingStore.getState().peers.get(socketId);
        if (peerState) {
          updatePeerScreenShare(socketId, true);
        }
      });
      void data;
    };

    const onPeerScreenShareStopped = (data: { userId: string }) => {
      peerConnections.current.forEach((_pc, socketId) => {
        const peerState = useMeetingStore.getState().peers.get(socketId);
        if (peerState) {
          updatePeerScreenShare(socketId, false);
        }
      });
      void data;
    };

    // Register listeners
    socket.on('room-users', onRoomUsers);
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);
    socket.on('offer', onOffer);
    socket.on('answer', onAnswer);
    socket.on('ice-candidate', onIceCandidate);
    socket.on('peer-audio-toggled', onPeerAudioToggled);
    socket.on('peer-video-toggled', onPeerVideoToggled);
    socket.on('peer-screen-share-started', onPeerScreenShareStarted);
    socket.on('peer-screen-share-stopped', onPeerScreenShareStopped);

    return () => {
      socket.off('room-users', onRoomUsers);
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
      socket.off('offer', onOffer);
      socket.off('answer', onAnswer);
      socket.off('ice-candidate', onIceCandidate);
      socket.off('peer-audio-toggled', onPeerAudioToggled);
      socket.off('peer-video-toggled', onPeerVideoToggled);
      socket.off('peer-screen-share-started', onPeerScreenShareStarted);
      socket.off('peer-screen-share-stopped', onPeerScreenShareStopped);
    };
  }, [
    socket,
    meetingCode,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
    updatePeerAudio,
    updatePeerVideo,
    updatePeerScreenShare,
  ]);

  return {
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    replaceVideoTrack,
    closeAllConnections,
    setLocalStream,
    peerConnections: peerConnections.current,
  };
}
