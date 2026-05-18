'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import Chatbot from '@/components/ui/Chatbot';
import BookNowPopup from '@/components/layout/BookNowPopup';
import { BookNowProvider } from '@/contexts/BookNowContext';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isCrmRoute = pathname?.startsWith('/crm');
  const isIntelligenceRoute = pathname?.startsWith('/intelligence');

  if (isAdminRoute || isCrmRoute || isIntelligenceRoute) {
    return <>{children}</>;
  }

  return (
    <BookNowProvider>
      <Navbar />
      <main className="flex-grow pt-[var(--site-navbar-offset)]">
        {children}
      </main>
      <Footer />
      <Chatbot />
      <Suspense fallback={null}>
        <BookNowPopup />
      </Suspense>
    </BookNowProvider>
  );
}

