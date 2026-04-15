'use client';

import { useRef, useEffect } from 'react';
import { MicOff, VideoOff, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoTileProps {
  stream: MediaStream | null;
  userName: string;
  isLocal?: boolean;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
}

const VideoTile = ({
  stream,
  userName,
  isLocal = false,
  audioEnabled = true,
  videoEnabled = true,
  isScreenSharing = false,
}: VideoTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'relative w-full h-full rounded-2xl overflow-hidden bg-dark-3 border border-white/5 group transition-all',
        isScreenSharing && 'border-blue-1/30 border-2'
      )}
    >
      {/* Video Element */}
      {stream && videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            'w-full h-full object-cover',
            isLocal && 'transform -scale-x-100'
          )}
        />
      ) : (
        /* Avatar fallback when camera is off */
        <div className="w-full h-full flex-center bg-dark-3">
          <div className="flex-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-1 to-purple-1 text-white text-2xl font-bold">
            {initials}
          </div>
        </div>
      )}

      {/* Overlay — Name and status indicators */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate max-w-[150px]">
              {userName}
              {isLocal && ' (You)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isScreenSharing && (
              <div className="p-1 rounded bg-blue-1/20">
                <Monitor className="size-3.5 text-blue-1" />
              </div>
            )}
            {!audioEnabled && (
              <div className="p-1 rounded bg-red-500/20">
                <MicOff className="size-3.5 text-red-400" />
              </div>
            )}
            {!videoEnabled && (
              <div className="p-1 rounded bg-red-500/20">
                <VideoOff className="size-3.5 text-red-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Local badge */}
      {isLocal && (
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-[10px] font-medium bg-blue-1/80 text-white rounded-md backdrop-blur-sm">
            YOU
          </span>
        </div>
      )}
    </div>
  );
};

export default VideoTile;
