'use client';

import { forwardRef } from 'react';
import Image from 'next/image';
import { SITE_BRAND, SITE_CONTACT, companyPhonesDisplayLine } from '@/lib/site-contact';

export type PdfTableRow = { label: string; value: string };

export const CrmPdfDocument = forwardRef<
  HTMLDivElement,
  {
    title: string;
    subtitle?: string;
    logoUrl?: string | null;
    rows: PdfTableRow[];
    sections?: { heading: string; rows: PdfTableRow[] }[];
    footerNote?: string;
  }
>(function CrmPdfDocument({ title, subtitle, logoUrl, rows, sections, footerNote }, ref) {
  return (
    <div
      ref={ref}
      className="crm-pdf-root mx-auto max-w-[210mm] bg-white p-8 text-slate-900 print:p-6"
      style={{ fontFamily: 'system-ui, Segoe UI, sans-serif' }}
    >
      <header className="mb-6 flex items-start justify-between gap-4 border-b-2 border-teal-700 pb-4">
        <div className="min-w-0 flex-1">
          {logoUrl ? (
            <div className="relative mb-3 h-14 w-40">
              <Image src={logoUrl} alt={SITE_BRAND.shortName} fill className="object-contain object-left" unoptimized />
            </div>
          ) : (
            <p className="text-lg font-extrabold text-teal-800">{SITE_BRAND.shortName}</p>
          )}
          <p className="text-xs text-slate-600">{SITE_BRAND.fullName}</p>
          <p className="mt-1 text-[10px] text-slate-500">{SITE_CONTACT.address}</p>
          <p className="text-[10px] text-slate-500">
            {SITE_CONTACT.email} · {companyPhonesDisplayLine()}
          </p>
        </div>
        <div className="text-right">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
          <p className="mt-2 text-[10px] text-slate-400">Generated {new Date().toLocaleString()}</p>
        </div>
      </header>

      <table className="mb-6 w-full border-collapse text-sm">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
              <td className="w-[38%] border border-slate-200 px-3 py-2 font-semibold text-slate-700">{r.label}</td>
              <td className="border border-slate-200 px-3 py-2 text-slate-900">{r.value || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {sections?.map((sec) => (
        <div key={sec.heading} className="mb-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-teal-800">{sec.heading}</h2>
          <table className="w-full border-collapse text-sm">
            <tbody>
              {sec.rows.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="w-[38%] border border-slate-200 px-3 py-2 font-semibold text-slate-700">{r.label}</td>
                  <td className="border border-slate-200 px-3 py-2">{r.value || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {footerNote && <p className="mt-6 text-xs text-slate-500 italic">{footerNote}</p>}
    </div>
  );
});
