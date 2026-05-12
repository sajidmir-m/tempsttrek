'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, Menu, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CRM_NAV, flattenNavLabels } from '@/config/crm-nav';

function titleForPath(pathname: string | null): string {
  if (!pathname) return 'CRM';
  if (pathname.startsWith('/crm/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/crm/itineraries')) return 'Itineraries';
  const map: Record<string, string> = {
    '/crm/manage-leads': 'Manage Leads',
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

export default function CrmTopBar({
  onOpenMobileMenu,
  email,
}: {
  onOpenMobileMenu: () => void;
  email: string;
}) {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => titleForPath(pathname), [pathname]);
  const navFlat = useMemo(() => flattenNavLabels(CRM_NAV), []);
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return navFlat.filter((n) => n.label.toLowerCase().includes(q) || n.href.toLowerCase().includes(q)).slice(0, 8);
  }, [search, navFlat]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const initial = (email || '?').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          className="inline-flex rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          aria-expanded="false"
        >
          <Menu size={20} />
        </button>

        <div className="hidden min-w-0 items-center gap-1 text-sm text-slate-500 md:flex">
          <Link href="/crm/dashboard" className="hover:text-teal-700">
            CRM
          </Link>
          <ChevronRight size={14} className="shrink-0 opacity-50" aria-hidden />
          <span className="truncate font-semibold text-slate-900">{title}</span>
        </div>
        <div className="min-w-0 flex-1 md:hidden">
          <p className="truncate text-sm font-bold text-slate-900">{title}</p>
        </div>

        <div className="relative mx-auto hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search modules…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            aria-label="Search CRM navigation"
          />
          {searchResults.length > 0 && search.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              {searchResults.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="block px-3 py-2 text-sm text-slate-700 hover:bg-teal-50"
                  onClick={() => setSearch('')}
                >
                  {r.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen((o) => !o)}
            >
              <Bell size={18} />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white py-4 text-center shadow-xl">
                <p className="text-sm font-medium text-slate-700">No new notifications</p>
                <p className="mt-1 px-4 text-xs text-slate-500">Follow-ups and arrivals will surface here in a future update.</p>
                <button
                  type="button"
                  className="mt-3 text-xs font-semibold text-teal-700 hover:underline"
                  onClick={() => setNotifOpen(false)}
                >
                  Close
                </button>
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
