'use client';

import { Video } from 'lucide-react';

export default function RecordingsPage() {
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Recordings</h1>

      <div className="flex-center flex-col gap-4 py-20">
        <Video className="size-16 text-gray-500" />
        <p className="text-lg text-gray-400">No recordings yet</p>
        <p className="text-sm text-gray-500">
          Meeting recordings will appear here once you start recording.
        </p>
      </div>
    </section>
  );
}
