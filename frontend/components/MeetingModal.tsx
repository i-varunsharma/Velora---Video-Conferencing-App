'use client';

import { useState } from 'react';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'create' | 'join';
  meetingLink?: string;
  onSubmit?: (value: string) => void;
  isLoading?: boolean;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  type,
  meetingLink,
  onSubmit,
  isLoading = false,
}: MeetingModalProps) => {
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (meetingLink) {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = () => {
    if (onSubmit && inputValue.trim()) {
      onSubmit(inputValue.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md mx-4 bg-dark-1 rounded-2xl p-8 border border-white/10 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-dark-3 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="size-5 text-gray-400" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>

        {/* Content based on type */}
        {type === 'create' && meetingLink && (
          <div className="space-y-4">
            <p className="text-gray-400">
              Share this link with others to invite them to your meeting:
            </p>
            <div className="flex items-center gap-2 bg-dark-3 rounded-xl p-3">
              <code className="flex-1 text-sm text-sky-1 break-all">{meetingLink}</code>
              <button
                onClick={handleCopy}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  copied ? 'bg-green-1/20 text-green-1' : 'hover:bg-dark-1 text-gray-400'
                )}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>
        )}

        {type === 'join' && (
          <div className="space-y-4">
            <p className="text-gray-400">
              Enter the meeting code or paste a meeting link:
            </p>
            <input
              type="text"
              placeholder="vel-xxxx-xxxx"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-dark-3 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-blue-1 focus:outline-none focus:ring-1 focus:ring-blue-1 transition-all placeholder:text-gray-500"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isLoading}
              className="w-full bg-blue-1 hover:bg-blue-1/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all flex-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Meeting'
              )}
            </button>
          </div>
        )}

        {/* Start Meeting button for create type without link yet */}
        {type === 'create' && !meetingLink && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Meeting title (optional)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-dark-3 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-blue-1 focus:outline-none focus:ring-1 focus:ring-blue-1 transition-all placeholder:text-gray-500"
            />
            <button
              onClick={() => onSubmit?.(inputValue || 'Instant Meeting')}
              disabled={isLoading}
              className="w-full bg-blue-1 hover:bg-blue-1/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all flex-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Start Meeting'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingModal;
