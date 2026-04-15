'use client';

import { use, useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';
import Loader from '@/components/Loader';
import { useMeetingStore } from '@/store/meeting.store';
import { syncUser } from '@/lib/api';

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

export default function MeetingPage({ params }: MeetingPageProps) {
  const { id: meetingCode } = use(params);
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const { isSetupComplete, setIsSetupComplete, setMeetingCode } = useMeetingStore();
  const [synced, setSynced] = useState(false);

  // Set meeting code in store
  useEffect(() => {
    setMeetingCode(meetingCode);
  }, [meetingCode, setMeetingCode]);

  // Sync user with backend
  useEffect(() => {
    const sync = async () => {
      if (!user || synced) return;
      try {
        const token = await getToken();
        if (token) {
          await syncUser(token, {
            email: user.emailAddresses[0]?.emailAddress || '',
            name: user.fullName || user.firstName || 'User',
            avatarUrl: user.imageUrl,
          });
          setSynced(true);
        }
      } catch {
        // Non-critical — continue anyway
        setSynced(true);
      }
    };
    sync();
  }, [user, getToken, synced]);

  // Reset setup on unmount
  useEffect(() => {
    return () => {
      setIsSetupComplete(false);
    };
  }, [setIsSetupComplete]);

  if (!isLoaded || !isSignedIn) return <Loader />;

  if (!isSetupComplete) {
    return (
      <MeetingSetup
        meetingCode={meetingCode}
        onJoin={() => setIsSetupComplete(true)}
      />
    );
  }

  return <MeetingRoom meetingCode={meetingCode} />;
}
