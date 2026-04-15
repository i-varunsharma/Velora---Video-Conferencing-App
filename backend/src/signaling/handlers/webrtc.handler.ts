import { Socket } from 'socket.io';
import {
  OfferPayload,
  AnswerPayload,
  ICECandidatePayload,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../../types/socket.types';
import { logger } from '../../utils/logger';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

/**
 * WebRTC Signaling Handler
 * Forwards SDP offers, answers, and ICE candidates between peers.
 * The server never inspects or modifies the WebRTC payloads —
 * it acts purely as a relay/signaling intermediary.
 */
export function registerWebRTCHandlers(socket: TypedSocket): void {
  /**
   * offer: Forward a WebRTC SDP offer to a specific peer.
   */
  socket.on('offer', (data: OfferPayload) => {
    try {
      const { targetId, sdp } = data;

      if (!targetId || !sdp) {
        socket.emit('error', { message: 'Offer requires targetId and sdp' });
        return;
      }

      logger.debug(`[offer] ${socket.id} → ${targetId}`);

      socket.to(targetId).emit('offer', {
        senderId: socket.id,
        sdp,
      });
    } catch (error) {
      logger.error('Error handling offer:', error);
      socket.emit('error', { message: 'Failed to forward offer' });
    }
  });

  /**
   * answer: Forward a WebRTC SDP answer to a specific peer.
   */
  socket.on('answer', (data: AnswerPayload) => {
    try {
      const { targetId, sdp } = data;

      if (!targetId || !sdp) {
        socket.emit('error', { message: 'Answer requires targetId and sdp' });
        return;
      }

      logger.debug(`[answer] ${socket.id} → ${targetId}`);

      socket.to(targetId).emit('answer', {
        senderId: socket.id,
        sdp,
      });
    } catch (error) {
      logger.error('Error handling answer:', error);
      socket.emit('error', { message: 'Failed to forward answer' });
    }
  });

  /**
   * ice-candidate: Forward an ICE candidate to a specific peer.
   */
  socket.on('ice-candidate', (data: ICECandidatePayload) => {
    try {
      const { targetId, candidate } = data;

      if (!targetId || !candidate) {
        socket.emit('error', { message: 'ICE candidate requires targetId and candidate' });
        return;
      }

      logger.debug(`[ice-candidate] ${socket.id} → ${targetId}`);

      socket.to(targetId).emit('ice-candidate', {
        senderId: socket.id,
        candidate,
      });
    } catch (error) {
      logger.error('Error handling ice-candidate:', error);
      socket.emit('error', { message: 'Failed to forward ICE candidate' });
    }
  });
}
