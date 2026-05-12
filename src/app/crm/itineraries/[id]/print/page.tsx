import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PrintPdfToolbar from '@/components/crm/PrintPdfToolbar';

type Asset = { id: string; image_url: string; caption: string | null; sort_order: number };

export default async function ItineraryPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: itin, error } = await supabase.from('crm_itineraries').select('*').eq('id', id).maybeSingle();
  if (error || !itin) return notFound();

  const { data: assets } = await supabase
    .from('crm_itinerary_assets')
    .select('id,image_url,caption,sort_order')
    .eq('itinerary_id', id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  const s = (itin.sections || {}) as any;
  const days = Array.isArray(s.days) ? s.days : [];
  const inclusions: string[] = Array.isArray(s.inclusions) ? s.inclusions : [];
  const exclusions: string[] = Array.isArray(s.exclusions) ? s.exclusions : [];
  const transfers = typeof s.transfers === 'string' ? s.transfers : '';
  const hotelNotes = typeof s.hotel_notes === 'string' ? s.hotel_notes : '';

  const a = (assets || []) as Asset[];

  return (
    <div className="bg-white text-black">
      <style>{`
        @media print {
          .noPrint { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <PrintPdfToolbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-700">Tempesttrek</p>
            <h1 className="text-3xl font-extrabold mt-2">{itin.title}</h1>
            <p className="text-sm text-gray-700 mt-3">
              {[
                itin.customer_name ? `Guest: ${itin.customer_name}` : null,
                itin.customer_phone ? `Phone: ${itin.customer_phone}` : null,
                itin.customer_email ? `Email: ${itin.customer_email}` : null,
              ]
                .filter(Boolean)
                .join(' • ')}
            </p>
            <p className="text-sm text-gray-700 mt-2">
              {[
                itin.travel_start ? `From: ${itin.travel_start}` : null,
                itin.travel_end ? `To: ${itin.travel_end}` : null,
              ]
                .filter(Boolean)
                .join('  ')}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-bold uppercase">{itin.status}</p>
          </div>
        </div>

        {a.length ? (
          <div className="mt-8 grid grid-cols-2 gap-3">
            {a.slice(0, 4).map((img) => (
              <div key={img.id} className="relative aspect-[4/3] border border-gray-200 rounded-lg overflow-hidden">
                <Image src={img.image_url} alt={img.caption || 'Itinerary image'} fill className="object-cover" sizes="50vw" />
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-10">
          <h2 className="text-lg font-extrabold border-b border-gray-200 pb-2">Day-wise plan</h2>
          <div className="mt-4 space-y-4">
            {days.length ? (
              days.map((d: any, idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-500">Day {idx + 1}</p>
                  <p className="text-base font-bold mt-1">{d?.title || `Day ${idx + 1}`}</p>
                  <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{d?.body || ''}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{itin.itinerary_body || ''}</p>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-extrabold">Inclusions</h3>
            {inclusions.length ? (
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-800">
                {inclusions.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 mt-2">—</p>
            )}
          </div>
          <div>
            <h3 className="text-base font-extrabold">Exclusions</h3>
            {exclusions.length ? (
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-800">
                {exclusions.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 mt-2">—</p>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-extrabold">Transfers</h3>
            <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{transfers || '—'}</p>
          </div>
          <div>
            <h3 className="text-base font-extrabold">Hotel notes</h3>
            <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{hotelNotes || '—'}</p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-500">
          <p>Tempesttrek • Srinagar, Kashmir • WhatsApp: +91 9906646113</p>
        </div>
      </div>
    </div>
  );
}

