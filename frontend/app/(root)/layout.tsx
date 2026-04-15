import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { ReactNode } from 'react';

const HomeLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="relative flex flex-col min-h-dvh">
      <Navbar />

      <div className="flex flex-1 pt-[72px]">
        <Sidebar />

        <section className="flex flex-1 flex-col px-6 pb-6 pt-8 max-md:pb-14 sm:px-14">
          <div className="w-full">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomeLayout;
