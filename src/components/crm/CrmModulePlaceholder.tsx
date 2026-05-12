import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import CrmButton from './ui/CrmButton';

export type CrmPlaceholderStep = { title: string; detail?: string };

export default function CrmModulePlaceholder({
  title,
  description,
  icon: Icon,
  nextSteps,
  adminHint,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Optional checklist of what this module will do or how to prepare data. */
  nextSteps?: CrmPlaceholderStep[];
  /** Optional note on using Admin vs this CRM screen while the module is unfinished. */
  adminHint?: string;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-lg shadow-slate-200/40">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-sky-700 text-white shadow-md">
          <Icon size={28} aria-hidden />
        </div>
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80">
          <Sparkles size={12} />
          Coming soon
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
        <p className="mt-2 text-xs text-slate-500">
          Navigation shell only for now — data and actions will wire in here when this module ships.
        </p>
      </div>

      {nextSteps && nextSteps.length > 0 && (
        <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">What will go here</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-700">
            {nextSteps.map((s) => (
              <li key={s.title} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" aria-hidden />
                <span>
                  <span className="font-semibold text-slate-900">{s.title}</span>
                  {s.detail ? <span className="block text-slate-600">{s.detail}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {adminHint ? (
        <p className="mt-6 rounded-2xl border border-teal-100 bg-teal-50/60 p-4 text-left text-sm leading-relaxed text-slate-700">
          {adminHint}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/crm/dashboard">
          <CrmButton variant="primary" size="md">
            Back to dashboard
          </CrmButton>
        </Link>
        <Link href="/admin" title="Full CMS: packages, staff, inquiries, itineraries, and more">
          <CrmButton variant="secondary" size="md">
            <ArrowLeft size={16} />
            Admin console (full access)
          </CrmButton>
        </Link>
      </div>
    </div>
  );
}
