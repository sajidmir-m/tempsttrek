'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PrintPdfToolbar from '@/components/crm/PrintPdfToolbar';
import { InvoicePrintStyles } from '@/components/crm/invoice-print-styles';
import HotelVoucherPdf from '@/components/crm/HotelVoucherPdf';
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

function preloadPdfImages(root: HTMLElement): Promise<void> {
  const urls = ['/gem.png', '/logo.png'];
  const inDom = Array.from(root.querySelectorAll('img')).map((img) => img.getAttribute('src') || '');
  const all = [...new Set([...urls, ...inDom.filter(Boolean)])];

  return Promise.all(
    all.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          const path = src.startsWith('http') ? src : `${window.location.origin}${src.startsWith('/') ? src : `/${src}`}`;
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = path;
          if (img.complete) resolve();
        })
    )
  ).then(() => undefined);
}

function InvoicePrintPageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const wantsAutoDownload = searchParams.get('download') === '1';

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [inv, setInv] = useState<InvoiceRow | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [assetsReady, setAssetsReady] = useState(false);
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

  useEffect(() => {
    if (!inv) {
      setAssetsReady(false);
      return;
    }
    let active = true;
    const tryPreload = () => {
      const root = pdfExportRef.current;
      if (!root) {
        requestAnimationFrame(tryPreload);
        return;
      }
      void preloadPdfImages(root).then(() => {
        if (active) setAssetsReady(true);
      });
    };
    requestAnimationFrame(tryPreload);
    return () => {
      active = false;
    };
  }, [inv]);

  const pdfFilename = useMemo(() => {
    if (!inv) return `hotel-voucher-${id ? id.slice(0, 8) : 'export'}.pdf`;
    const num = inv.invoice_number.replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_') || 'voucher';
    return `hotel-voucher-${num}.pdf`;
  }, [inv, id]);

  const handleDownloadPdf = useCallback(async () => {
    const el = pdfExportRef.current;
    if (!el) return;
    setPdfBusy(true);
    setPdfError(null);
    try {
      await preloadPdfImages(el);
      await downloadElementAsPdf(el, pdfFilename);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error('[invoice-pdf]', e);
      setPdfError('PDF download failed. Try again or use Print → Save as PDF.');
    } finally {
      setPdfBusy(false);
    }
  }, [pdfFilename]);

  useEffect(() => {
    if (layout !== 'wide') return;
    if (!wantsAutoDownload || loading || notFound || !inv || !assetsReady) return;
    let active = true;
    const t = window.setTimeout(() => {
      if (!active) return;
      void handleDownloadPdf();
    }, 700);
    return () => {
      active = false;
      window.clearTimeout(t);
    };
  }, [layout, wantsAutoDownload, loading, notFound, inv, assetsReady, handleDownloadPdf]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm font-medium text-neutral-900">
        Loading hotel voucher…
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

  return (
    <>
      <style>{`
        @media print {
          .noPrint { display: none !important; }
        }
      `}</style>

      <PrintPdfToolbar
        title="Hotel voucher PDF"
        banner={
          pdfError ??
          (wantsAutoDownload && layout === 'narrow'
            ? 'On this screen size we do not auto-start the download. Tap "Download PDF" when you are ready — it is faster and clearer than print-to-PDF on phones.'
            : null)
        }
        downloadLabel={pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
        onDownloadPdf={handleDownloadPdf}
        downloadDisabled={pdfBusy}
      />

      <div
        ref={pdfExportRef}
        className="invoice-pdf-root mx-auto min-h-screen w-full max-w-[210mm] overflow-visible bg-white pb-16"
      >
        <InvoicePrintStyles />
        <HotelVoucherPdf inv={inv} />
      </div>
    </>
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
