'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createMeeting } from '@/lib/api';
import { Copy, Check, Video, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PersonalRoomPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [meetingCode, setMeetingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePersonalRoom = async () => {
    setIsCreating(true);
    try {
      const token = await getToken();
      if (!token) return;

      const meeting = await createMeeting(token, {
        title: `${user?.fullName || 'My'}'s Personal Room`,
        type: 'PERSONAL',
      });

      setMeetingCode(meeting.meetingCode);
    } catch (error) {
      console.error('Failed to create personal room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (meetingCode) {
      const link = `${window.location.origin}/meeting/${meetingCode}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = () => {
    if (meetingCode) {
      router.push(`/meeting/${meetingCode}`);
    }
  };

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Personal Room</h1>

      <div className="bg-dark-1 rounded-2xl p-8 border border-white/5 max-w-2xl">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Topic</p>
            <p className="text-lg font-medium">
              {user?.fullName || 'My'}&apos;s Personal Meeting Room
            </p>
          </div>

          {meetingCode && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Meeting Code</p>
              <p className="text-lg font-mono text-sky-1">{meetingCode}</p>
            </div>
          )}

          {meetingCode && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Invite Link</p>
              <div className="flex items-center gap-2 bg-dark-3 rounded-xl p-3">
                <code className="flex-1 text-sm text-sky-1 break-all">
                  {window.location.origin}/meeting/{meetingCode}
                </code>
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

          <div className="flex items-center gap-4 pt-4">
            {!meetingCode ? (
              <button
                onClick={handleCreatePersonalRoom}
                disabled={isCreating}
                className="flex-center gap-2 bg-blue-1 hover:bg-blue-1/90 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl transition-all"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Video className="size-4" />
                    Create Personal Room
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="flex-center gap-2 bg-blue-1 hover:bg-blue-1/90 text-white font-medium px-6 py-3 rounded-xl transition-all"
              >
                <Video className="size-4" />
                Start Meeting
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
