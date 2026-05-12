'use client';

import { cn } from '@/lib/cn';
import type { SelectHTMLAttributes } from 'react';

const baseClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-100/50 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20';

type Props = SelectHTMLAttributes<HTMLSelectElement> & { label?: string };

export default function CrmSelect({ className, label, id, children, ...props }: Props) {
  const sid = id || props.name;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={sid} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </label>
      ) : null}
      <select id={sid} className={cn(baseClass, className)} {...props}>
        {children}
      </select>
    </div>
  );
}
