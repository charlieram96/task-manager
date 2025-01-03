'use client';

import { Navigation } from '@/components/layout/navigation';
import { MobileNav } from '@/components/layout/mobile-nav';
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
      <div className="block md:hidden">
        <MobileNav />
      </div>
      <main className="md:pl-72 min-h-screen">
        <div className="h-full pt-16 md:pt-4 px-4 sm:px-6 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
