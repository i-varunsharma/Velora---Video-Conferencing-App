'use client';

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Users,
  PhoneOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isParticipantListOpen: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleParticipants: () => void;
  onLeave: () => void;
  participantCount: number;
}

const MediaControls = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isParticipantListOpen,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleParticipants,
  onLeave,
  participantCount,
}: MediaControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-3 p-4">
      {/* Microphone Toggle */}
      <button
        onClick={onToggleAudio}
        className={cn('control-btn', isAudioEnabled ? 'control-btn-active' : 'control-btn-muted')}
        title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isAudioEnabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}
      </button>

      {/* Camera Toggle */}
      <button
        onClick={onToggleVideo}
        className={cn('control-btn', isVideoEnabled ? 'control-btn-active' : 'control-btn-muted')}
        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? <Video className="size-5" /> : <VideoOff className="size-5" />}
      </button>

      {/* Screen Share Toggle */}
      <button
        onClick={onToggleScreenShare}
        className={cn(
          'control-btn',
          isScreenSharing ? 'bg-blue-1 ring-2 ring-blue-1/50' : 'control-btn-active'
        )}
        title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
      >
        {isScreenSharing ? (
          <MonitorOff className="size-5" />
        ) : (
          <Monitor className="size-5" />
        )}
      </button>

      {/* Participants Toggle */}
      <button
        onClick={onToggleParticipants}
        className={cn(
          'control-btn relative',
          isParticipantListOpen ? 'bg-blue-1' : 'control-btn-active'
        )}
        title="Participants"
      >
        <Users className="size-5" />
        {participantCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-1 text-white text-[10px] font-bold w-5 h-5 rounded-full flex-center">
            {participantCount}
          </span>
        )}
      </button>

      {/* Leave Call */}
      <button
        onClick={onLeave}
        className="control-btn control-btn-danger ml-4"
        title="Leave meeting"
      >
        <PhoneOff className="size-5" />
      </button>
    </div>
  );
};

export default MediaControls;
