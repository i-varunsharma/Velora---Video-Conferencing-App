'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

/**
 * useSocket — Manages a single Socket.io connection to the signaling server.
 * Returns the socket instance and connection state helpers.
 */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  const getSocket = useCallback((): Socket => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
    }
    return socketRef.current;
  }, []);

  const connect = useCallback(() => {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }, [getSocket]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    getSocket,
    connect,
    disconnect,
    socketRef,
  };
}
