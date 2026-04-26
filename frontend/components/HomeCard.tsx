'use client';

import { cn } from '@/lib/utils';
import {
  Plus,
  UserPlus,
  Calendar,
  Video,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Plus,
  UserPlus,
  Calendar,
  Video,
};

const colorMap: Record<string, { bg: string; text: string; shadow: string; cardBg: string }> = {
  orange: { bg: 'bg-white/20', text: 'text-white', shadow: 'shadow-[0_8px_32px_rgba(249,115,22,0.4)]', cardBg: 'bg-gradient-to-br from-orange-500 to-orange-700' },
  blue: { bg: 'bg-white/20', text: 'text-white', shadow: 'shadow-[0_8px_32px_rgba(59,130,246,0.4)]', cardBg: 'bg-gradient-to-br from-blue-500 to-blue-700' },
  purple: { bg: 'bg-white/20', text: 'text-white', shadow: 'shadow-[0_8px_32px_rgba(168,85,247,0.4)]', cardBg: 'bg-gradient-to-br from-purple-500 to-purple-700' },
  yellow: { bg: 'bg-white/20', text: 'text-white', shadow: 'shadow-[0_8px_32px_rgba(234,179,8,0.4)]', cardBg: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
};

interface HomeCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onClick: () => void;
}

const HomeCard = ({ title, description, icon, color, onClick }: HomeCardProps) => {
  const Icon = iconMap[icon] || Plus;
  const theme = colorMap[color] || colorMap.blue;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col justify-between w-full min-h-[240px] rounded-[24px] p-6 md:p-7 cursor-pointer group transition-all duration-500 hover:-translate-y-2 text-left overflow-hidden border border-white/10',
        theme.cardBg,
        theme.shadow
      )}
      id={`home-card-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      {/* Floating internal gradient for that glass edge light */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* The 3D Floating Icon Container - Guaranteed not to overlap with text because of flex justify-between */}
      <div className={cn('relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 mb-6 group-hover:scale-110 group-hover:-rotate-3', theme.bg, theme.shadow)}>
        <Icon className={cn('size-7', theme.text)} />
      </div>

      <div className="relative flex flex-col mt-auto w-full gap-1.5">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight break-words">{title}</h3>
        <p className="text-sm md:text-base font-medium text-white/50 group-hover:text-white/80 transition-colors duration-300 break-words">{description}</p>
      </div>
    </button>
  );
};

export default HomeCard;
