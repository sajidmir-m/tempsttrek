'use client';

import { cn } from '@/lib/cn';
import type { TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string };

export default function CrmTextarea({ className, label, id, ...props }: Props) {
  const tid = id || props.name;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={tid} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </label>
      ) : null}
      <textarea
        id={tid}
        className={cn(
          'min-h-[88px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-100/50 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20',
          className
        )}
        {...props}
      />
    </div>
  );
}
