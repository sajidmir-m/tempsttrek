'use client';

import { Download, Printer } from 'lucide-react';

export default function PrintPdfToolbar({
  title = 'PDF export',
  subtitle,
  banner,
  downloadLabel = 'Download PDF',
  printLabel = 'Print / Save as PDF',
  onDownloadPdf,
  downloadDisabled = false,
}: {
  title?: string;
  /** If set, replaces the default responsive help text under the title. */
  subtitle?: string;
  /** Optional callout (e.g. on small screens when auto-download is skipped). */
  banner?: string | null;
  downloadLabel?: string;
  printLabel?: string;
  onDownloadPdf?: () => void | Promise<void>;
  downloadDisabled?: boolean;
}) {
  return (
    <div
      className="noPrint sticky top-14 z-40 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md"
      role="region"
      aria-label="PDF download and print"
    >
      <div
        className="mx-auto max-w-4xl px-3 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pb-3.5 sm:pt-[max(0.75rem,env(safe-area-inset-top))]"
        style={{ paddingLeft: 'max(0.75rem, env(safe-area-inset-left))', paddingRight: 'max(0.75rem, env(safe-area-inset-right))' }}
      >
        {banner ? (
          <p className="mb-3 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-xs font-medium leading-snug text-teal-950 sm:text-sm">
            {banner}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold tracking-tight text-slate-900">{title}</p>
            {subtitle != null && subtitle !== '' ? (
              <p className="mt-0.5 text-xs leading-snug text-slate-600 sm:text-sm">{subtitle}</p>
            ) : (
              <>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:hidden">
                  <span className="font-semibold text-teal-800">Download PDF</span> — saves the file on this device (fastest).
                  <br />
                  <span className="font-semibold text-slate-800">Print / Save as PDF</span> — opens the browser; pick
                  &quot;Save as PDF&quot; in the print menu if you prefer that route.
                </p>
                <p className="mt-1 hidden text-sm leading-relaxed text-slate-600 sm:block">
                  Use <strong>Download PDF</strong> for a direct file. Use <strong>Print / Save as PDF</strong> for paper or to save
                  through your browser&apos;s print dialog.
                </p>
              </>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-2.5">
            {onDownloadPdf ? (
              <button
                type="button"
                disabled={downloadDisabled}
                onClick={() => void onDownloadPdf()}
                aria-label={downloadLabel}
                aria-busy={downloadDisabled}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm outline-none hover:bg-teal-800 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              >
                <Download className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                {downloadLabel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => window.print()}
              aria-label={printLabel}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:bg-slate-100 transition-colors"
            >
              <Printer className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
              {printLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
