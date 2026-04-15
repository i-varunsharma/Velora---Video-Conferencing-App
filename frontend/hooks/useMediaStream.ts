'use client';

import { useState, useCallback } from 'react';

interface MediaStreamState {
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * useMediaStream — Manages local camera/microphone access.
 * Handles permission errors gracefully.
 */
export function useMediaStream() {
  const [state, setState] = useState<MediaStreamState>({
    stream: null,
    error: null,
    isLoading: false,
  });

  const getMediaStream = useCallback(
    async (
      video: boolean = true,
      audio: boolean = true
    ): Promise<MediaStream | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: video
            ? {
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                frameRate: { ideal: 30, max: 60 },
                facingMode: 'user',
              }
            : false,
          audio: audio
            ? {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            : false,
        });

        setState({ stream, error: null, isLoading: false });
        return stream;
      } catch (err) {
        let errorMessage = 'Could not access media devices.';

        if (err instanceof DOMException) {
          switch (err.name) {
            case 'NotAllowedError':
              errorMessage =
                'Camera/microphone permission denied. Please allow access in your browser settings.';
              break;
            case 'NotFoundError':
              errorMessage = 'No camera or microphone found on this device.';
              break;
            case 'NotReadableError':
              errorMessage =
                'Camera/microphone is already in use by another application.';
              break;
            case 'OverconstrainedError':
              errorMessage =
                'Camera does not meet the required constraints. Trying with default settings...';
              // Fallback to basic constraints
              try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({
                  video: video,
                  audio: audio,
                });
                setState({ stream: fallbackStream, error: null, isLoading: false });
                return fallbackStream;
              } catch {
                errorMessage = 'Could not access camera with any settings.';
              }
              break;
            default:
              errorMessage = `Media error: ${err.message}`;
          }
        }

        setState({ stream: null, error: errorMessage, isLoading: false });
        return null;
      }
    },
    []
  );

  const stopStream = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
      setState({ stream: null, error: null, isLoading: false });
    }
  }, [state.stream]);

  const getScreenShare = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });
      return stream;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        // User cancelled the screen share picker — not an error
        return null;
      }
      console.error('Screen share error:', err);
      return null;
    }
  }, []);

  return {
    ...state,
    getMediaStream,
    stopStream,
    getScreenShare,
  };
}
