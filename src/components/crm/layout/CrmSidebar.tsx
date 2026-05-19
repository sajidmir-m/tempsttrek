'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { CrmNavEntry } from '@/config/crm-nav';
import { CRM_NAV } from '@/config/crm-nav';
import { SITE_BRAND } from '@/lib/site-contact';

const STORAGE_KEY = 'crm_sidebar_collapsed';

function NavLink({
  item,
  pathname,
  depth,
  collapsed,
  onNavigate,
}: {
  item: CrmNavEntry;
  pathname: string | null;
  depth: number;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some((c) => c.href && (pathname === c.href || pathname?.startsWith(c.href + '/')));
  });

  useEffect(() => {
    if (!item.children) return;
    const childActive = item.children.some(
      (c) => c.href && (pathname === c.href || pathname?.startsWith(c.href + '/'))
    );
    if (childActive) setOpen(true);
  }, [pathname, item.children]);

  if (item.children?.length) {
    return (
      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => !collapsed && setOpen((o) => !o)}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors',
            'text-slate-300 hover:bg-white/5 hover:text-white',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? item.label : undefined}
          aria-expanded={open}
        >
          <item.icon size={18} className="shrink-0 text-teal-400" aria-hidden />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <ChevronRight size={16} className={cn('shrink-0 transition-transform', open && 'rotate-90')} />
            </>
          )}
        </button>
        {!collapsed && open && (
          <div className="ml-2 space-y-0.5 border-l border-white/10 pl-2">
            {item.children.map((child) => (
              <NavLink
                key={child.id}
                item={child}
                pathname={pathname}
                depth={depth + 1}
                collapsed={false}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!item.href) return null;
  const active = pathname === item.href || pathname?.startsWith(item.href + '/');
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
        active ? 'bg-teal-500/20 text-white ring-1 ring-teal-400/30' : 'text-slate-300 hover:bg-white/5 hover:text-white',
        depth > 0 && 'pl-2',
        collapsed && 'justify-center px-2'
      )}
    >
      <item.icon size={18} className={cn('shrink-0', active ? 'text-teal-300' : 'text-slate-400')} aria-hidden />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export default function CrmSidebar({
  email,
  role,
  onLogout,
  collapsed,
  onToggleCollapse,
  onNavigate,
}: {
  email: string;
  role: string;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const widthClass = collapsed ? 'w-[4.5rem]' : 'w-64 xl:w-72';

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 flex-col border-r border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white transition-[width] duration-200',
        widthClass
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-4">
        {!collapsed && (
          <div className="min-w-0 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-400/90">{SITE_BRAND.shortName}</p>
            <p className="text-lg font-extrabold leading-tight tracking-tight">Travel ERP</p>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden shrink-0 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10 lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-2 py-3" aria-label="CRM primary">
        {collapsed
          ? CRM_NAV.map((item) => {
              const href = item.href || item.children?.[0]?.href;
              if (!href) return null;
              const Icon = item.icon;
              const active =
                pathname === href ||
                pathname?.startsWith(href + '/') ||
                item.children?.some((c) => pathname === c.href || pathname?.startsWith((c.href || '') + '/'));
              return (
                <Link
                  key={item.id}
                  href={href}
                  title={item.label}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center justify-center rounded-xl px-2 py-2.5 transition-colors',
                    active ? 'bg-teal-500/20 text-white ring-1 ring-teal-400/30' : 'text-slate-300 hover:bg-white/5'
                  )}
                >
                  <Icon size={18} className={cn(active ? 'text-teal-300' : 'text-slate-400')} />
                </Link>
              );
            })
          : CRM_NAV.map((item) => (
              <NavLink key={item.id} item={item} pathname={pathname} depth={0} collapsed={false} onNavigate={onNavigate} />
            ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-white/10 px-3 py-4">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          <BarChart3 size={18} className="text-teal-400" />
          {!collapsed && <span>Back to Admin</span>}
        </Link>
        {!collapsed && (
          <>
            <p className="truncate px-1 text-xs text-slate-500">{email || '—'}</p>
            <p className="px-1 text-[10px] text-slate-600">Role: {role}</p>
          </>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/15 px-3 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/25"
        >
          <LogOut size={16} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}

export function readInitialSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}
