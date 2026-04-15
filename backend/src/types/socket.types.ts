// ─── Peer Information ───────────────────────────────────

export interface PeerInfo {
  socketId: string;
  userId: string;
  userName: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
}

// ─── Room State ─────────────────────────────────────────

export interface RoomState {
  meetingCode: string;
  participants: Map<string, PeerInfo>;
  createdAt: Date;
  isActive: boolean;
}

// ─── Client → Server Events ────────────────────────────

export interface ClientToServerEvents {
  'join-room': (data: JoinRoomPayload) => void;
  'leave-room': (data: LeaveRoomPayload) => void;
  'offer': (data: OfferPayload) => void;
  'answer': (data: AnswerPayload) => void;
  'ice-candidate': (data: ICECandidatePayload) => void;
  'toggle-audio': (data: ToggleMediaPayload) => void;
  'toggle-video': (data: ToggleMediaPayload) => void;
  'screen-share-started': (data: ScreenSharePayload) => void;
  'screen-share-stopped': (data: ScreenSharePayload) => void;
}

// ─── Server → Client Events ────────────────────────────

export interface ServerToClientEvents {
  'room-users': (users: PeerInfo[]) => void;
  'user-joined': (peer: PeerInfo) => void;
  'user-left': (data: { userId: string; socketId: string }) => void;
  'offer': (data: { senderId: string; sdp: RTCSessionDescriptionInit }) => void;
  'answer': (data: { senderId: string; sdp: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { senderId: string; candidate: RTCIceCandidateInit }) => void;
  'peer-audio-toggled': (data: { userId: string; enabled: boolean }) => void;
  'peer-video-toggled': (data: { userId: string; enabled: boolean }) => void;
  'peer-screen-share-started': (data: { userId: string }) => void;
  'peer-screen-share-stopped': (data: { userId: string }) => void;
  'error': (data: { message: string }) => void;
}

// ─── Event Payloads ─────────────────────────────────────

export interface JoinRoomPayload {
  meetingCode: string;
  userId: string;
  userName: string;
}

export interface LeaveRoomPayload {
  meetingCode: string;
}

export interface OfferPayload {
  targetId: string;
  sdp: RTCSessionDescriptionInit;
}

export interface AnswerPayload {
  targetId: string;
  sdp: RTCSessionDescriptionInit;
}

export interface ICECandidatePayload {
  targetId: string;
  candidate: RTCIceCandidateInit;
}

export interface ToggleMediaPayload {
  meetingCode: string;
  enabled: boolean;
}

export interface ScreenSharePayload {
  meetingCode: string;
}

// ─── Inter-Server Events (reserved for scaling) ────────

export interface InterServerEvents {
  ping: () => void;
}

// ─── Socket Data ────────────────────────────────────────

export interface SocketData {
  userId: string;
  userName: string;
  currentRoom: string | null;
}

// ─── WebRTC Types (for Node.js environment) ────────────

export interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
}

export interface RTCIceCandidateInit {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
}
