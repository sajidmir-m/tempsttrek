'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, Menu, Moon, Search, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CRM_NAV, flattenNavLabels } from '@/config/crm-nav';
import { supabase } from '@/lib/supabase';
import { useCrmTheme } from '@/contexts/CrmThemeContext';

function titleForPath(pathname: string | null): string {
  if (!pathname) return 'CRM';
  if (pathname.startsWith('/crm/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/crm/itineraries')) return 'Itineraries';
  const map: Record<string, string> = {
    '/crm/manage-leads': 'Manage Leads',
    '/crm/manage-inquiries': 'Inquiries',
    '/crm/manage-quotations': 'Manage Quotations',
    '/crm/manage-hotel': 'Manage Hotel',
    '/crm/manage-expense': 'Manage Expense',
    '/crm/manage-invoice': 'Manage Invoice',
    '/crm/manage-voucher': 'Manage Voucher',
    '/crm/manage-module': 'Manage Module',
    '/crm/assign-call/view': 'Assign Call · View',
    '/crm/assign-call/lead-source': 'Assign Call · Lead Source',
    '/crm/settings': 'Settings',
    '/crm/users': 'Users',
    '/crm/ledger': 'Ledger',
  };
  for (const [k, v] of Object.entries(map)) {
    if (pathname === k || pathname.startsWith(k + '/')) return v;
  }
  return 'CRM';
}

type Notif = { id: string; title: string; body: string | null; link: string | null; is_read: boolean; created_at: string };

export default function CrmTopBar({
  onOpenMobileMenu,
  email,
}: {
  onOpenMobileMenu: () => void;
  email: string;
}) {
  const pathname = usePathname();
  const { theme, toggle } = useCrmTheme();
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => titleForPath(pathname), [pathname]);
  const navFlat = useMemo(() => flattenNavLabels(CRM_NAV), []);
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return navFlat.filter((n) => n.label.toLowerCase().includes(q) || n.href.toLowerCase().includes(q)).slice(0, 8);
  }, [search, navFlat]);

  const unread = notifs.filter((n) => !n.is_read).length;

  const loadNotifs = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('crm_notifications')
      .select('id,title,body,link,is_read,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifs((data || []) as Notif[]);
  }, []);

  useEffect(() => {
    void loadNotifs();
    const channel = supabase
      .channel('crm-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'crm_notifications' }, () => {
        void loadNotifs();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadNotifs]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const markRead = async (id: string) => {
    await supabase.from('crm_notifications').update({ is_read: true }).eq('id', id);
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const initial = (email || '?').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          className="inline-flex rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 lg:hidden dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="hidden min-w-0 items-center gap-1 text-sm text-slate-500 md:flex dark:text-slate-400">
          <Link href="/crm/dashboard" className="hover:text-teal-700 dark:hover:text-teal-400">
            CRM
          </Link>
          <ChevronRight size={14} className="shrink-0 opacity-50" aria-hidden />
          <span className="truncate font-semibold text-slate-900 dark:text-white">{title}</span>
        </div>
        <div className="min-w-0 flex-1 md:hidden">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{title}</p>
        </div>

        <div className="relative mx-auto hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search modules…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            aria-label="Search CRM navigation"
          />
          {searchResults.length > 0 && search.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800">
              {searchResults.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="block px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => setSearch('')}
                >
                  {r.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen((o) => !o)}
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-80 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-600 dark:bg-slate-800">
                {notifs.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications</p>
                ) : (
                  notifs.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className={cn(
                        'block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700',
                        !n.is_read && 'bg-teal-50/50 dark:bg-teal-900/20'
                      )}
                      onClick={() => {
                        void markRead(n.id);
                        if (n.link) window.location.href = n.link;
                        setNotifOpen(false);
                      }}
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                      {n.body && <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{n.body}</p>}
                      <p className="mt-1 text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-sky-700 text-xs font-bold text-white shadow-md"
            title={email}
          >
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
