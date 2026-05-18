'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { resolvePortalRole, type PortalRole } from '@/lib/portal-role';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import CrmSidebar, { readInitialSidebarCollapsed } from './CrmSidebar';
import CrmTopBar from './CrmTopBar';

export default function CrmShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPrintView = Boolean(pathname?.includes('/print'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<PortalRole>('admin');
  const [email, setEmail] = useState<string>('');
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCollapsed(readInitialSidebarCollapsed());
  }, []);

  useEffect(() => {
    let cancelled = false;

    const applySession = async (session: { user: { id: string; email?: string | null } } | null) => {
      if (!session) {
        if (!cancelled) router.push('/admin');
        return;
      }
      if (cancelled) return;
      setEmail(session.user.email || '');
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();
      if (cancelled) return;
      setRole(resolvePortalRole(data?.role));
    };

    supabase.auth.getSession().then(({ data: { session } }) => applySession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => {
      drawerRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
    }, 50);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [mobileOpen, closeMobile]);

  return (
    <div className="flex min-h-dvh bg-slate-100/90 text-slate-900">
      <div className="hidden lg:flex lg:shrink-0 lg:sticky lg:top-0 lg:h-dvh lg:py-0">
        <CrmSidebar
          email={email}
          role={role}
          onLogout={logout}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <CrmTopBar onOpenMobileMenu={() => setMobileOpen(true)} email={email} />
        <main
          className={cn(
            'mx-auto min-w-0 w-full max-w-[1600px] flex-1 px-4 sm:px-6 lg:px-8',
            isPrintView ? 'pb-6 pt-1 sm:pb-8 sm:pt-2' : 'py-6'
          )}
        >
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="CRM navigation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <div
            ref={drawerRef}
            className="absolute left-0 top-0 flex h-full w-[min(20rem,92vw)] shadow-2xl"
          >
            <CrmSidebar
              email={email}
              role={role}
              onLogout={logout}
              collapsed={false}
              onToggleCollapse={() => {}}
              onNavigate={closeMobile}
            />
            <button
              type="button"
              className="absolute right-2 top-3 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={closeMobile}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
