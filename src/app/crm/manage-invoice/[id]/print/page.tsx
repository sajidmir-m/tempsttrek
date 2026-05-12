'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PrintPdfToolbar from '@/components/crm/PrintPdfToolbar';
import { InvoicePrintStyles } from '@/components/crm/invoice-print-styles';
import { CrmPdfLetterhead, CrmPdfLetterheadStyles } from '@/components/crm/crm-pdf-letterhead';
import { SITE_BRAND, SITE_CONTACT, companyPhonesDisplayLine } from '@/lib/site-contact';
import { downloadElementAsPdf } from '@/lib/crm-pdf-download';
import { usePdfViewportLayout } from '@/hooks/usePdfViewportLayout';

type InvoiceRow = {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  amount: number;
  status: string;
  issue_date: string;
  notes: string | null;
};

function InvoicePrintPageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const wantsAutoDownload = searchParams.get('download') === '1';

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [inv, setInv] = useState<InvoiceRow | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const pdfExportRef = useRef<HTMLDivElement>(null);
  const layout = usePdfViewportLayout();

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    try {
      const { data, error } = await supabase
        .from('crm_invoices')
        .select('id,invoice_number,customer_name,customer_email,amount,status,issue_date,notes')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
        setInv(null);
        return;
      }
      setInv(data as InvoiceRow);
    } catch {
      setNotFound(true);
      setInv(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const pdfFilename = useMemo(() => {
    if (!inv) return `invoice-${id ? id.slice(0, 8) : 'export'}.pdf`;
    const num = inv.invoice_number.replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_') || 'invoice';
    return `invoice-${num}.pdf`;
  }, [inv, id]);

  const handleDownloadPdf = useCallback(async () => {
    const el = pdfExportRef.current;
    if (!el) return;
    setPdfBusy(true);
    try {
      await downloadElementAsPdf(el, pdfFilename);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error('[invoice-pdf]', e);
      window.print();
    } finally {
      setPdfBusy(false);
    }
  }, [pdfFilename]);

  useEffect(() => {
    if (layout !== 'wide') return;
    if (!wantsAutoDownload || loading || notFound || !inv) return;
    let active = true;
    const t = window.setTimeout(() => {
      if (!active) return;
      void handleDownloadPdf();
    }, 600);
    return () => {
      active = false;
      window.clearTimeout(t);
    };
  }, [layout, wantsAutoDownload, loading, notFound, inv, handleDownloadPdf]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm font-medium text-neutral-900">
        Loading invoice…
      </div>
    );
  }

  if (notFound || !inv) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white p-6 text-center text-neutral-900">
        <p className="font-semibold">Invoice not found or you are not signed in.</p>
        <p className="max-w-md text-sm text-neutral-700">Open this page from Manage Invoices while signed in as staff.</p>
      </div>
    );
  }

  const amountStr = `₹${Number(inv.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const status = (inv.status || '—').toUpperCase();

  return (
    <div className="invoice-pdf-root min-h-screen bg-white">
      <InvoicePrintStyles />
      <CrmPdfLetterheadStyles />
      <style>{`
        @media print {
          .noPrint { display: none !important; }
        }
      `}</style>

      <PrintPdfToolbar
        title="Invoice PDF"
        banner={
          wantsAutoDownload && layout === 'narrow'
            ? 'On this screen size we do not auto-start the download. Tap "Download PDF" when you are ready — it is clearer on phones than print-to-PDF.'
            : null
        }
        downloadLabel={pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
        onDownloadPdf={handleDownloadPdf}
        downloadDisabled={pdfBusy}
      />

      <div
        ref={pdfExportRef}
        className="mx-auto max-w-[210mm] px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-1 sm:px-8 sm:pb-16"
      >
        <CrmPdfLetterhead subtitle="Tax invoice / billing summary (CRM)" />

        <div className="invoice-pdf-banner pdf-avoid-break">Invoice · {SITE_BRAND.shortName}</div>

        <div className="invoice-pdf-title-row pdf-avoid-break">
          <h1 className="invoice-pdf-h1">Invoice</h1>
          <p className="invoice-pdf-invno">{inv.invoice_number}</p>
        </div>

        <div className="invoice-pdf-grid" role="presentation">
          <div className="invoice-pdf-cell">
            <div className="invoice-pdf-label">Bill to</div>
            <div className="invoice-pdf-value">{inv.customer_name}</div>
          </div>
          <div className="invoice-pdf-cell">
            <div className="invoice-pdf-label">Issue date</div>
            <div className="invoice-pdf-value">{inv.issue_date}</div>
          </div>
          <div className="invoice-pdf-cell">
            <div className="invoice-pdf-label">Email</div>
            <div className="invoice-pdf-value">{inv.customer_email?.trim() || '—'}</div>
          </div>
          <div className="invoice-pdf-cell">
            <div className="invoice-pdf-label">Status</div>
            <div className="invoice-pdf-value">
              <span className="invoice-pdf-status">{status}</span>
            </div>
          </div>
        </div>

        <table className="invoice-pdf-table pdf-avoid-break">
          <thead>
            <tr>
              <th style={{ width: '70%' }}>Description</th>
              <th style={{ width: '30%', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Tour / travel services</strong>
                <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--pdf-muted)' }}>
                  As per agreed package and quotation. Add GST lines in your accounting system if required.
                </div>
              </td>
              <td className="invoice-pdf-amount">{amountStr}</td>
            </tr>
          </tbody>
        </table>

        <div className="invoice-pdf-notes pdf-avoid-break">
          <h3>Notes</h3>
          <p>{inv.notes?.trim() || '—'}</p>
        </div>

        <div className="invoice-pdf-footer">
          <p className="m-0 font-bold text-neutral-900">{SITE_BRAND.legalName}</p>
          <p className="mt-1 m-0">
            {SITE_CONTACT.address} · {SITE_CONTACT.email} · {companyPhonesDisplayLine()}
          </p>
          <p className="mt-2 m-0 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
            CRM-generated summary. Use your official GST invoice where legally required.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePrintPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm font-medium text-neutral-900">
          Loading…
        </div>
      }
    >
      <InvoicePrintPageInner />
    </Suspense>
  );
}
