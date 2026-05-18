'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export type DetailField = { label: string; value: ReactNode };

export default function CrmEntityDetailModal({
  open,
  title,
  subtitle,
  sections,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  sections: { heading: string; fields: DetailField[] }[];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center" role="presentation">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2 className="pr-10 text-xl font-extrabold text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
            <div className="mt-6 space-y-5">
              {sections.map((section) => (
                <div
                  key={section.heading}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 backdrop-blur-sm"
                >
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-teal-700">{section.heading}</h3>
                  <dl className="space-y-2">
                    {section.fields.map((f) => (
                      <div key={f.label} className="flex justify-between gap-4 text-sm">
                        <dt className="text-slate-500">{f.label}</dt>
                        <dd className="text-right font-medium text-slate-900">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
