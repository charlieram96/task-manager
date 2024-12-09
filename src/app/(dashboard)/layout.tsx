'use client';

import { Navigation } from '@/components/layout/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuthStatus } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!checkAuthStatus()) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Navigation />
      </div>
      <main className="md:pl-72 min-h-screen">
        <div className="h-full p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
