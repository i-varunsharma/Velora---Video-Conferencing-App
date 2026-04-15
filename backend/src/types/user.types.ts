export interface UserResponse {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface ClerkUserData {
  clerkId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}
