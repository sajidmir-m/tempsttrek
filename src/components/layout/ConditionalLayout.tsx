'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import Chatbot from '@/components/ui/Chatbot';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isCrmRoute = pathname?.startsWith('/crm');
  const isIntelligenceRoute = pathname?.startsWith('/intelligence');

  if (isAdminRoute || isCrmRoute || isIntelligenceRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}

