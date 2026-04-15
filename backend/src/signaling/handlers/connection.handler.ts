import { Socket } from 'socket.io';
import { RoomManager } from '../room-manager';
import {
  JoinRoomPayload,
  LeaveRoomPayload,
  PeerInfo,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../../types/socket.types';
import { logger } from '../../utils/logger';
import { meetingService } from '../../services/meeting.service';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

/**
 * Connection Handler
 * Manages room join/leave and disconnection events.
 */
export function registerConnectionHandlers(
  socket: TypedSocket,
  roomManager: RoomManager
): void {
  /**
   * join-room: Client wants to join a meeting room.
   * 1. Add the peer to the room
   * 2. Join the Socket.io room for targeted broadcasting
   * 3. Notify existing participants
   * 4. Send current room state to the new participant
   */
  socket.on('join-room', async (data: JoinRoomPayload) => {
    try {
      const { meetingCode, userId, userName } = data;

      if (!meetingCode || !userId || !userName) {
        socket.emit('error', { message: 'Missing required fields: meetingCode, userId, userName' });
        return;
      }

      // Store user data on the socket for disconnect handling
      socket.data.userId = userId;
      socket.data.userName = userName;
      socket.data.currentRoom = meetingCode;

      const peer: PeerInfo = {
        socketId: socket.id,
        userId,
        userName,
        audioEnabled: true,
        videoEnabled: true,
        isScreenSharing: false,
      };

      // Get existing participants BEFORE joining
      const existingParticipants = roomManager.getRoomParticipants(meetingCode);

      // Add the peer to the room
      roomManager.joinRoom(meetingCode, peer);

      // Join the Socket.io room
      socket.join(meetingCode);

      // Send existing room participants to the new peer
      socket.emit('room-users', existingParticipants);

      // Notify existing participants about the new peer
      socket.to(meetingCode).emit('user-joined', peer);

      // Track participant in the database (fire and forget)
      meetingService.addParticipant(meetingCode, userId).catch((err) => {
        logger.debug('Could not track participant in DB (may not exist yet):', err);
      });

      logger.info(`[join-room] ${userName} joined ${meetingCode} (${existingParticipants.length + 1} peers)`);
    } catch (error) {
      logger.error('Error handling join-room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  /**
   * leave-room: Client wants to leave a meeting room.
   */
  socket.on('leave-room', (data: LeaveRoomPayload) => {
    try {
      const { meetingCode } = data;
      handleLeaveRoom(socket, roomManager, meetingCode);
    } catch (error) {
      logger.error('Error handling leave-room:', error);
    }
  });

  /**
   * disconnect: Socket disconnected (browser close, network issue, etc.)
   */
  socket.on('disconnect', (reason) => {
    try {
      logger.info(`[disconnect] Socket ${socket.id} disconnected: ${reason}`);
      const result = roomManager.removeFromAllRooms(socket.id);

      if (result) {
        socket.to(result.meetingCode).emit('user-left', {
          userId: result.peer.userId,
          socketId: socket.id,
        });

        // Track participant leaving in DB
        if (result.peer.userId) {
          meetingService.markParticipantLeft(result.meetingCode, result.peer.userId).catch(() => {
            // Silent fail — non-critical
          });
        }
      }
    } catch (error) {
      logger.error('Error handling disconnect:', error);
    }
  });
}

/**
 * Handles a peer leaving a room cleanly.
 */
function handleLeaveRoom(
  socket: TypedSocket,
  roomManager: RoomManager,
  meetingCode: string
): void {
  const peer = roomManager.leaveRoom(meetingCode, socket.id);

  if (peer) {
    socket.to(meetingCode).emit('user-left', {
      userId: peer.userId,
      socketId: socket.id,
    });

    socket.leave(meetingCode);
    socket.data.currentRoom = null;

    logger.info(`[leave-room] ${peer.userName} left ${meetingCode}`);

    // Track in DB
    meetingService.markParticipantLeft(meetingCode, peer.userId).catch(() => {
      // Silent fail
    });
  }
}
