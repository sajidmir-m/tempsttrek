'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PrintPdfToolbar from '@/components/crm/PrintPdfToolbar';
import WintsumBookingVoucherPdf from '@/components/crm/pdf/WintsumBookingVoucherPdf';
import { CrmPdfHeroHeaderStyles } from '@/components/crm/pdf/CrmPdfHeroHeader';
import { CrmPdfDocumentStyles } from '@/components/crm/pdf/crm-pdf-document-styles';
import { payloadFromVoucherRow, type BookingVoucherRecord } from '@/lib/booking-voucher-sync';
import { useSiteBranding } from '@/hooks/useSiteBranding';
import { downloadElementAsPdf } from '@/lib/crm-pdf-download';
import { usePdfViewportLayout } from '@/hooks/usePdfViewportLayout';

function VoucherPrintInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const branding = useSiteBranding();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [row, setRow] = useState<BookingVoucherRecord | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const layout = usePdfViewportLayout();

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('crm_booking_vouchers').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        setNotFound(true);
        setRow(null);
        return;
      }
      setRow(data as BookingVoucherRecord);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const voucherData = useMemo(() => {
    if (!row) return null;
    const payload = payloadFromVoucherRow(row);
    return {
      booking_id: row.booking_id,
      customer_name: row.customer_name,
      booking_date: row.travel_start || new Date().toISOString().slice(0, 10),
      payload,
      total_amount: Number(row.total_amount) || payload.total_amount,
      advance_paid: payload.advance_paid,
    };
  }, [row]);

  const pdfFilename = useMemo(() => `voucher_${voucherData?.booking_id || id.slice(0, 8)}.pdf`, [voucherData, id]);

  const handleDownloadPdf = useCallback(async () => {
    const el = pdfRef.current;
    if (!el) return;
    setPdfBusy(true);
    try {
      await downloadElementAsPdf(el, pdfFilename);
    } catch {
      window.print();
    } finally {
      setPdfBusy(false);
    }
  }, [pdfFilename]);

  useEffect(() => {
    if (layout !== 'wide' || loading || notFound || !voucherData || branding.loading) return;
    if (searchParams.get('download') !== '1') return;
    const t = window.setTimeout(() => void handleDownloadPdf(), 700);
    return () => window.clearTimeout(t);
  }, [layout, loading, notFound, voucherData, branding.loading, searchParams, handleDownloadPdf]);

  if (loading || branding.loading) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm">Loading voucher…</div>;
  }
  if (notFound || !voucherData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-white p-6 text-center">
        <p className="font-semibold">Voucher not found.</p>
        <p className="text-sm text-slate-600">Create it under CRM → Manage Voucher.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <CrmPdfHeroHeaderStyles />
      <CrmPdfDocumentStyles />
      <style>{`@media print { .noPrint { display: none !important; } }`}</style>
      <PrintPdfToolbar
        title="Booking confirmation voucher"
        downloadLabel={pdfBusy ? 'Preparing…' : 'Download PDF'}
        onDownloadPdf={handleDownloadPdf}
        downloadDisabled={pdfBusy}
      />
      <div ref={pdfRef} className="pb-16">
        <WintsumBookingVoucherPdf data={voucherData} branding={branding} />
      </div>
    </div>
  );
}

export default function BookingVoucherPrintPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <VoucherPrintInner />
    </Suspense>
  );
}
