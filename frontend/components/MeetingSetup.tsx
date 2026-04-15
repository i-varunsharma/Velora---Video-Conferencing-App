'use client';

import { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMeetingStore } from '@/store/meeting.store';
import { useMediaStream } from '@/hooks/useMediaStream';

interface MeetingSetupProps {
  onJoin: () => void;
  meetingCode: string;
}

const MeetingSetup = ({ onJoin, meetingCode }: MeetingSetupProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { getMediaStream, error: mediaError } = useMediaStream();

  const {
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    setLocalStream,
    setAudioEnabled,
    setVideoEnabled,
  } = useMeetingStore();

  // Get user media on mount
  useEffect(() => {
    const initMedia = async () => {
      const stream = await getMediaStream(true, true);
      if (stream) {
        setLocalStream(stream);
      }
    };
    initMedia();

    return () => {
      // Don't stop stream here — it will be used by MeetingRoom
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const toggleAudio = () => {
    setAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    setVideoEnabled(!isVideoEnabled);
  };

  return (
    <div className="flex-center min-h-dvh bg-dark-2 p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Ready to join?</h1>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <Settings className="size-4" />
            Meeting: <span className="text-sky-1 font-mono">{meetingCode}</span>
          </p>
        </div>

        {/* Video Preview */}
        <div className="relative rounded-2xl overflow-hidden bg-dark-1 aspect-video mb-6 border border-white/5">
          {localStream && isVideoEnabled ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="w-full h-full flex-center bg-dark-3">
              <div className="flex flex-col items-center gap-3">
                <div className="flex-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-1 to-purple-1 text-white text-3xl font-bold">
                  <VideoOff className="size-10" />
                </div>
                <p className="text-gray-400 text-sm">Camera is off</p>
              </div>
            </div>
          )}

          {/* Media Error */}
          {mediaError && (
            <div className="absolute inset-0 flex-center bg-dark-3/90 backdrop-blur-sm p-4">
              <div className="text-center max-w-sm">
                <VideoOff className="size-10 text-red-400 mx-auto mb-3" />
                <p className="text-red-400 text-sm">{mediaError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={toggleAudio}
            className={cn(
              'control-btn',
              isAudioEnabled ? 'control-btn-active' : 'control-btn-muted'
            )}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={cn(
              'control-btn',
              isVideoEnabled ? 'control-btn-active' : 'control-btn-muted'
            )}
            title={isVideoEnabled ? 'Camera off' : 'Camera on'}
          >
            {isVideoEnabled ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </button>
        </div>

        {/* Join Button */}
        <div className="flex justify-center">
          <button
            onClick={onJoin}
            className="bg-blue-1 hover:bg-blue-1/90 text-white font-semibold text-lg px-12 py-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-1/30"
          >
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;
