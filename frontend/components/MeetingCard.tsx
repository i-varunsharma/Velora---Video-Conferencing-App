'use client';

import { type MeetingResponse } from '@/lib/api';
import { Calendar, Clock, Users, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';

interface MeetingCardProps {
  meeting: MeetingResponse;
  type: 'upcoming' | 'previous';
}

const MeetingCard = ({ meeting, type }: MeetingCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const link = `${window.location.origin}/meeting/${meeting.meetingCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-1/20 text-yellow-1',
    ACTIVE: 'bg-green-1/20 text-green-1',
    ENDED: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <div className="bg-dark-1 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {type === 'upcoming' ? (
            <Calendar className="size-4 text-blue-1" />
          ) : (
            <Clock className="size-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-400">
            {formatDate(meeting.scheduledAt || meeting.createdAt)}
          </span>
        </div>
        <span
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            statusColors[meeting.status] || statusColors.PENDING
          )}
        >
          {meeting.status}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-1 transition-colors">
        {meeting.title}
      </h3>

      <p className="text-sm text-gray-500 mb-4 font-mono">
        {meeting.meetingCode}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="size-4" />
          <span className="text-sm">
            {meeting._count?.participants || 0} participants
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={cn(
              'p-2 rounded-lg transition-all',
              copied ? 'bg-green-1/20 text-green-1' : 'hover:bg-dark-3 text-gray-400'
            )}
            title="Copy meeting link"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>

          {type === 'upcoming' && meeting.status !== 'ENDED' && (
            <Link
              href={`/meeting/${meeting.meetingCode}`}
              className="px-4 py-2 bg-blue-1 hover:bg-blue-1/90 text-white text-sm font-medium rounded-xl transition-all"
            >
              Start
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
