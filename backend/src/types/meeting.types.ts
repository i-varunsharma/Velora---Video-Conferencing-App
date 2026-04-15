export enum MeetingStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

export enum MeetingType {
  INSTANT = 'INSTANT',
  SCHEDULED = 'SCHEDULED',
  PERSONAL = 'PERSONAL',
}

export enum ParticipantRole {
  HOST = 'HOST',
  PARTICIPANT = 'PARTICIPANT',
}

// ─── User Types ─────────────────────────────────────────

export interface ClerkUserData {
  clerkId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface UserResponse {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
}

// ─── Meeting Types ──────────────────────────────────────

export interface CreateMeetingDTO {
  title: string;
  type: MeetingType;
  scheduledAt?: string; // ISO date string
}

export interface MeetingResponse {
  id: string;
  meetingCode: string;
  title: string;
  hostId: string;
  status: MeetingStatus;
  type: MeetingType;
  scheduledAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  host?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  _count?: {
    participants: number;
  };
}

export type MeetingFilter = 'upcoming' | 'previous' | 'all';

export interface UpdateMeetingStatusDTO {
  status: MeetingStatus;
}

// ─── Participant Types ──────────────────────────────────

export interface ParticipantResponse {
  id: string;
  meetingId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: Date;
  leftAt: Date | null;
  user?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}
