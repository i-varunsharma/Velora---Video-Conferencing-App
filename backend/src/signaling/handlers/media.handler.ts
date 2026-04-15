import { Socket } from 'socket.io';
import { RoomManager } from '../room-manager';
import {
  ToggleMediaPayload,
  ScreenSharePayload,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../../types/socket.types';
import { logger } from '../../utils/logger';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

/**
 * Media Handler
 * Manages audio/video toggle and screen share state broadcasts.
 * These events notify peers of media state changes so they can
 * update their UI accordingly (e.g., show muted icon).
 */
export function registerMediaHandlers(
  socket: TypedSocket,
  roomManager: RoomManager
): void {
  /**
   * toggle-audio: Broadcast audio mute/unmute state to room.
   */
  socket.on('toggle-audio', (data: ToggleMediaPayload) => {
    try {
      const { meetingCode, enabled } = data;
      const userId = socket.data.userId;

      if (!meetingCode || !userId) return;

      roomManager.updatePeerState(meetingCode, socket.id, {
        audioEnabled: enabled,
      });

      socket.to(meetingCode).emit('peer-audio-toggled', {
        userId,
        enabled,
      });

      logger.debug(`[toggle-audio] ${userId} → ${enabled ? 'unmuted' : 'muted'}`);
    } catch (error) {
      logger.error('Error handling toggle-audio:', error);
    }
  });

  /**
   * toggle-video: Broadcast video on/off state to room.
   */
  socket.on('toggle-video', (data: ToggleMediaPayload) => {
    try {
      const { meetingCode, enabled } = data;
      const userId = socket.data.userId;

      if (!meetingCode || !userId) return;

      roomManager.updatePeerState(meetingCode, socket.id, {
        videoEnabled: enabled,
      });

      socket.to(meetingCode).emit('peer-video-toggled', {
        userId,
        enabled,
      });

      logger.debug(`[toggle-video] ${userId} → ${enabled ? 'on' : 'off'}`);
    } catch (error) {
      logger.error('Error handling toggle-video:', error);
    }
  });

  /**
   * screen-share-started: Notify room that this user started screen sharing.
   */
  socket.on('screen-share-started', (data: ScreenSharePayload) => {
    try {
      const { meetingCode } = data;
      const userId = socket.data.userId;

      if (!meetingCode || !userId) return;

      roomManager.updatePeerState(meetingCode, socket.id, {
        isScreenSharing: true,
      });

      socket.to(meetingCode).emit('peer-screen-share-started', { userId });

      logger.info(`[screen-share] ${userId} started sharing screen in ${meetingCode}`);
    } catch (error) {
      logger.error('Error handling screen-share-started:', error);
    }
  });

  /**
   * screen-share-stopped: Notify room that this user stopped screen sharing.
   */
  socket.on('screen-share-stopped', (data: ScreenSharePayload) => {
    try {
      const { meetingCode } = data;
      const userId = socket.data.userId;

      if (!meetingCode || !userId) return;

      roomManager.updatePeerState(meetingCode, socket.id, {
        isScreenSharing: false,
      });

      socket.to(meetingCode).emit('peer-screen-share-stopped', { userId });

      logger.info(`[screen-share] ${userId} stopped sharing screen in ${meetingCode}`);
    } catch (error) {
      logger.error('Error handling screen-share-stopped:', error);
    }
  });
}
