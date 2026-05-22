'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PrintPdfToolbar from '@/components/crm/PrintPdfToolbar';
import { ItineraryLuxePrintStyles } from '@/components/crm/itinerary-luxe-print-styles';
import ProfessionalItineraryPdf from '@/components/crm/pdf/ProfessionalItineraryPdf';
import type { ItineraryPdfHotel } from '@/components/crm/pdf/ProfessionalItineraryPdf';
import { normalizeItinerarySections } from '@/lib/itinerary-utils';
import type { ItinerarySections } from '@/components/crm/types';
import type { BookingVoucherPayload } from '@/lib/crm-catalog';
import { useSiteBranding } from '@/hooks/useSiteBranding';
import type { DestinationDetail } from '@/components/crm/itinerary/DestinationDayCards';
import { downloadElementAsPdf } from '@/lib/crm-pdf-download';

type Asset = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  after_day: number | null;
};

function ItineraryPrintPageInner() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const branding = useSiteBranding();
  const pdfExportRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [itin, setItin] = useState<Record<string, unknown> | null>(null);
  const [sections, setSections] = useState<ItinerarySections | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [hotelsById, setHotelsById] = useState<Map<string, ItineraryPdfHotel>>(new Map());
  const [destinationsById, setDestinationsById] = useState<Map<string, DestinationDetail>>(new Map());
  const [pdfBusy, setPdfBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    try {
      const { data: row, error: itErr } = await supabase.from('crm_itineraries').select('*').eq('id', id).maybeSingle();
      if (itErr || !row) {
        setNotFound(true);
        return;
      }
      const r = row as Record<string, unknown>;
      setItin(r);
      const normalized = normalizeItinerarySections(r.sections as ItinerarySections);
      setSections(normalized);

      const destIds = [
        ...new Set(normalized.days.flatMap((d) => d.destination_ids || [])),
      ];
      if (destIds.length > 0) {
        const { data: dests } = await supabase
          .from('crm_destinations')
          .select('id,name,base_location,route_from,route_to,description,featured_image_url')
          .in('id', destIds);
        const dMap = new Map<string, DestinationDetail>();
        for (const d of dests || []) dMap.set((d as DestinationDetail).id, d as DestinationDetail);
        setDestinationsById(dMap);
      } else {
        setDestinationsById(new Map());
      }

      const hotelIds = [
        ...new Set(normalized.night_stays.map((s) => s.hotel_id).filter(Boolean) as string[]),
      ];
      if (hotelIds.length > 0) {
        const { data: hotels } = await supabase
          .from('crm_hotels')
          .select('id,name,location,category,hotel_type,featured_image_url')
          .in('id', hotelIds);
        const map = new Map<string, ItineraryPdfHotel>();
        for (const h of hotels || []) {
          map.set((h as ItineraryPdfHotel).id, h as ItineraryPdfHotel);
        }
        setHotelsById(map);
      } else {
        setHotelsById(new Map());
      }

      const { data: imgs, error: imgErr } = await supabase
        .from('crm_itinerary_assets')
        .select('id,image_url,caption,sort_order,after_day')
        .eq('itinerary_id', id)
        .order('sort_order', { ascending: true });
      if (!imgErr) {
        setAssets(
          (imgs || []).map((raw: Record<string, unknown>) => ({
            id: String(raw.id),
            image_url: String(raw.image_url),
            caption: (raw.caption as string) || null,
            sort_order: Number(raw.sort_order) || 0,
            after_day: raw.after_day != null && raw.after_day !== '' ? Number(raw.after_day) : null,
          }))
        );
      } else {
        setAssets([]);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const bookingVoucher = useMemo(() => {
    if (!itin?.booking_voucher) return null;
    return itin.booking_voucher as BookingVoucherPayload;
  }, [itin]);

  const pdfFilename = useMemo(() => {
    if (!itin) return `itinerary-${id.slice(0, 8)}.pdf`;
    const slug = String(itin.title ?? 'itinerary')
      .trim()
      .slice(0, 48)
      .replace(/[^\w\u0900-\u0FFF\-]+/g, '_');
    return `${slug || 'itinerary'}-${id.slice(0, 8)}.pdf`;
  }, [itin, id]);

  const handleDownloadPdf = useCallback(async () => {
    const el = pdfExportRef.current;
    if (!el) return;
    setPdfBusy(true);
    try {
      await downloadElementAsPdf(el, pdfFilename);
    } catch (err) {
      console.error('[itinerary-pdf]', err);
      const narrow =
        typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;
      window.alert(
        narrow
          ? 'PDF download failed on this screen size. Open this page on a desktop browser and try again.'
          : 'PDF download failed. Try Print / Save as PDF, or refresh and retry Download PDF.'
      );
    } finally {
      setPdfBusy(false);
    }
  }, [pdfFilename]);

  if (loading || branding.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm font-medium text-neutral-900">
        Loading itinerary…
      </div>
    );
  }

  if (notFound || !itin || !sections) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white p-6 text-center text-neutral-900">
        <p className="font-semibold">Itinerary not found or you are not signed in.</p>
      </div>
    );
  }

  return (
    <div className="itinerary-pdf-root min-h-screen bg-white">
      <ItineraryLuxePrintStyles />
      <PrintPdfToolbar
        title="Itinerary PDF"
        subtitle="Download PDF saves a file on this device. Use Print only if you need paper."
        downloadLabel={pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
        onDownloadPdf={handleDownloadPdf}
        downloadDisabled={pdfBusy}
      />

      <div
        ref={pdfExportRef}
        className="itinerary-pdf-export-wrap mx-auto w-full px-4 pb-16 pt-2 sm:px-8"
        style={{ maxWidth: '210mm', width: '100%' }}
      >
        <ProfessionalItineraryPdf
          branding={branding}
          itin={itin}
          sections={sections}
          hotelsById={hotelsById}
          destinationsById={destinationsById}
          assets={assets}
          bookingVoucher={bookingVoucher}
        />
      </div>
    </div>
  );
}

export default function ItineraryPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm">Loading…</div>
      }
    >
      <ItineraryPrintPageInner />
    </Suspense>
  );
}
