'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PrintPdfToolbar from '@/components/crm/PrintPdfToolbar';
import { ItineraryPrintStyles } from '@/components/crm/itinerary-print-styles';
import { CrmPdfLetterhead, CrmPdfLetterheadStyles } from '@/components/crm/crm-pdf-letterhead';
import { SITE_BRAND, SITE_CONTACT, companyPhonesDisplayLine } from '@/lib/site-contact';
import { downloadElementAsPdf } from '@/lib/crm-pdf-download';
import { usePdfViewportLayout } from '@/hooks/usePdfViewportLayout';

type Asset = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  after_day: number | null;
  kind: string | null;
};

function padDay(n: number) {
  return String(n).padStart(2, '0');
}

function sortAssets(list: Asset[]) {
  return [...list].sort((x, y) => x.sort_order - y.sort_order || x.id.localeCompare(y.id));
}

function ItineraryPrintPageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const wantsAutoDownload = searchParams.get('download') === '1';

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [itin, setItin] = useState<Record<string, unknown> | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
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
      const { data: row, error: itErr } = await supabase.from('crm_itineraries').select('*').eq('id', id).maybeSingle();
      if (itErr || !row) {
        setNotFound(true);
        setItin(null);
        setAssets([]);
        return;
      }
      setItin(row as Record<string, unknown>);
      const { data: imgs, error: imgErr } = await supabase
        .from('crm_itinerary_assets')
        .select('*')
        .eq('itinerary_id', id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (imgErr) {
        setAssets([]);
      } else {
        const mapped: Asset[] = (imgs || []).map((raw: Record<string, unknown>) => ({
          id: String(raw.id),
          image_url: String(raw.image_url),
          caption: (raw.caption as string) || null,
          sort_order: Number(raw.sort_order) || 0,
          after_day: raw.after_day != null && raw.after_day !== '' ? Number(raw.after_day) : null,
          kind: raw.kind != null ? String(raw.kind) : null,
        }));
        setAssets(mapped);
      }
    } catch {
      setNotFound(true);
      setItin(null);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const pdfFilename = useMemo(() => {
    if (!itin) return `itinerary-${id ? id.slice(0, 8) : 'export'}.pdf`;
    const slug = String(itin.title ?? 'itinerary')
      .trim()
      .slice(0, 48)
      .replace(/[^\w\u0900-\u0FFF\-]+/g, '_')
      .replace(/_+/g, '_');
    const tail = id ? id.slice(0, 8) : 'export';
    return `${slug || 'itinerary'}-${tail}.pdf`;
  }, [itin, id]);

  const handleDownloadPdf = useCallback(async () => {
    const el = pdfExportRef.current;
    if (!el) return;
    setPdfBusy(true);
    try {
      await downloadElementAsPdf(el, pdfFilename);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error('[itinerary-pdf]', e);
      window.print();
    } finally {
      setPdfBusy(false);
    }
  }, [pdfFilename]);

  useEffect(() => {
    if (layout !== 'wide') return;
    if (!wantsAutoDownload || loading || notFound || !itin) return;
    let active = true;
    const t = window.setTimeout(() => {
      if (!active) return;
      void handleDownloadPdf();
    }, 700);
    return () => {
      active = false;
      window.clearTimeout(t);
    };
  }, [layout, wantsAutoDownload, loading, notFound, itin, handleDownloadPdf]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm font-medium text-neutral-900">
        Loading itinerary…
      </div>
    );
  }

  if (notFound || !itin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white p-6 text-center text-neutral-900">
        <p className="font-semibold">Itinerary not found or you are not signed in.</p>
        <p className="max-w-md text-sm text-neutral-700">
          Open this page from the CRM while signed in as staff. Use <strong>Print</strong> or <strong>Download PDF</strong> from the toolbar when viewing a valid itinerary.
        </p>
      </div>
    );
  }

  const s = (itin.sections || {}) as Record<string, unknown>;
  const days = Array.isArray(s.days) ? (s.days as { title?: string; body?: string }[]) : [];
  const inclusions: string[] = Array.isArray(s.inclusions) ? (s.inclusions as string[]) : [];
  const exclusions: string[] = Array.isArray(s.exclusions) ? (s.exclusions as string[]) : [];
  const transfers = typeof s.transfers === 'string' ? s.transfers : '';
  const hotelNotes = typeof s.hotel_notes === 'string' ? s.hotel_notes : '';
  const itineraryBody = typeof itin.itinerary_body === 'string' ? itin.itinerary_body : '';

  const a = assets;
  const headerAssets = sortAssets(a.filter((x) => x.after_day == null));
  const assetsAfterDay = (dayNum: number) => sortAssets(a.filter((x) => x.after_day === dayNum));

  const guest = itin.customer_name ? String(itin.customer_name) : '—';
  const phone = itin.customer_phone ? String(itin.customer_phone) : '—';
  const email = itin.customer_email ? String(itin.customer_email) : '—';
  const tStart = itin.travel_start ? String(itin.travel_start) : '—';
  const tEnd = itin.travel_end ? String(itin.travel_end) : '—';
  const status = itin.status ? String(itin.status).toUpperCase() : '—';

  return (
    <div className="itinerary-pdf-root min-h-screen bg-white">
      <ItineraryPrintStyles />
      <CrmPdfLetterheadStyles />
      <style>{`
        @media print {
          .noPrint { display: none !important; }
        }
      `}</style>

      <PrintPdfToolbar
        title="Itinerary PDF"
        banner={
          wantsAutoDownload && layout === 'narrow'
            ? 'On this screen size we do not auto-start the download. Tap "Download PDF" when you are ready — it is faster and clearer than print-to-PDF on phones.'
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
        <CrmPdfLetterhead subtitle="Kashmir tours · Guest itinerary" />

        <div className="itinerary-pdf-brandbar pdf-avoid-break">Tempesttrek · Kashmir · Tour itinerary</div>

        <h1 className="itinerary-pdf-title">{String(itin.title ?? 'Itinerary')}</h1>
        <p className="itinerary-pdf-sub">Confirmed plan &amp; inclusions summary (subject to voucher)</p>

        <div className="itinerary-pdf-meta" role="presentation">
          <div className="itinerary-pdf-meta-cell">
            <div className="itinerary-pdf-meta-label">Guest name</div>
            <div className="itinerary-pdf-meta-value">{guest}</div>
          </div>
          <div className="itinerary-pdf-meta-cell">
            <div className="itinerary-pdf-meta-label">Contact number</div>
            <div className="itinerary-pdf-meta-value">{phone}</div>
          </div>
          <div className="itinerary-pdf-meta-cell">
            <div className="itinerary-pdf-meta-label">Email</div>
            <div className="itinerary-pdf-meta-value">{email}</div>
          </div>
          <div className="itinerary-pdf-meta-cell">
            <div className="itinerary-pdf-meta-label">Booking status</div>
            <div className="itinerary-pdf-meta-value">{status}</div>
          </div>
          <div className="itinerary-pdf-meta-cell">
            <div className="itinerary-pdf-meta-label">Travel from</div>
            <div className="itinerary-pdf-meta-value">{tStart}</div>
          </div>
          <div className="itinerary-pdf-meta-cell">
            <div className="itinerary-pdf-meta-label">Travel to</div>
            <div className="itinerary-pdf-meta-value">{tEnd}</div>
          </div>
        </div>

        {headerAssets.length > 0 ? (
          <div className="itinerary-pdf-section">
            <h2 className="itinerary-pdf-section-head">Destination highlights</h2>
            <div className="itinerary-pdf-images">
              {headerAssets.map((img) => (
                <div key={img.id} className="itinerary-pdf-imgcell">
                  {img.kind ? <div className="itinerary-pdf-imgkind">{img.kind}</div> : null}
                  <div className="itinerary-pdf-imgwrap">
                    {/* eslint-disable-next-line @next/next/no-img-element -- print/PDF: avoid optimizer edge cases */}
                    <img src={img.image_url} alt={img.caption || 'Itinerary'} className="h-full w-full object-cover" />
                  </div>
                  {img.caption ? <p className="itinerary-pdf-imgcap">{img.caption}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="itinerary-pdf-section">
          <h2 className="itinerary-pdf-section-head">Day wise itinerary</h2>
          {days.length > 0 ? (
            days.map((d, idx) => {
              const dayNum = idx + 1;
              const rowImgs = assetsAfterDay(dayNum);
              return (
                <div key={idx} className="itinerary-pdf-dayblock">
                  <div className="itinerary-pdf-day">
                    <div className="itinerary-pdf-daynum">Day {padDay(dayNum)}</div>
                    <div className="itinerary-pdf-daytitle">{d?.title?.trim() || `Day ${dayNum}`}</div>
                    <div className="itinerary-pdf-daybody">{d?.body || ''}</div>
                  </div>
                  {rowImgs.length > 0 ? (
                    <div className="itinerary-pdf-images-inline">
                      {rowImgs.map((img) => (
                        <div key={img.id} className="itinerary-pdf-imgcell">
                          {img.kind ? <div className="itinerary-pdf-imgkind">{img.kind}</div> : null}
                          <div className="itinerary-pdf-imgwrap itinerary-pdf-imgwrap--sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.image_url} alt={img.caption || ''} className="h-full w-full object-cover" />
                          </div>
                          {img.caption ? <p className="itinerary-pdf-imgcap">{img.caption}</p> : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="itinerary-pdf-note">{itineraryBody || '—'}</div>
          )}
        </div>

        <div className="itinerary-pdf-section">
          <h2 className="itinerary-pdf-section-head">Package inclusions &amp; exclusions</h2>
          <div className="itinerary-pdf-two-col">
            <div className="itinerary-pdf-col">
              <h4>Inclusions</h4>
              {inclusions.length > 0 ? (
                <ul className="itinerary-pdf-ul">
                  {inclusions.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              ) : (
                <p className="itinerary-pdf-meta-value m-0">As per agreed quotation / voucher.</p>
              )}
            </div>
            <div className="itinerary-pdf-col">
              <h4>Exclusions</h4>
              {exclusions.length > 0 ? (
                <ul className="itinerary-pdf-ul">
                  {exclusions.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              ) : (
                <p className="itinerary-pdf-meta-value m-0">See quotation for items not included.</p>
              )}
            </div>
          </div>
        </div>

        <div className="itinerary-pdf-section">
          <h2 className="itinerary-pdf-section-head">Transfers &amp; hotel notes</h2>
          <div className="itinerary-pdf-two-col">
            <div className="itinerary-pdf-col">
              <h4>Transfers</h4>
              <p className="itinerary-pdf-meta-value m-0 whitespace-pre-wrap">{transfers || '—'}</p>
            </div>
            <div className="itinerary-pdf-col">
              <h4>Hotel notes</h4>
              <p className="itinerary-pdf-meta-value m-0 whitespace-pre-wrap">{hotelNotes || '—'}</p>
            </div>
          </div>
        </div>

        <div className="itinerary-pdf-footer">
          <p className="m-0 font-bold text-neutral-900">{SITE_BRAND.legalName}</p>
          <p className="mt-1 m-0">
            {SITE_CONTACT.address} · {SITE_CONTACT.email} · {companyPhonesDisplayLine()}
          </p>
          <p className="mt-2 m-0 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
            This document is for guest reference only. Final services are as per signed voucher and availability.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ItineraryPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm font-medium text-neutral-900">
          Loading…
        </div>
      }
    >
      <ItineraryPrintPageInner />
    </Suspense>
  );
}
