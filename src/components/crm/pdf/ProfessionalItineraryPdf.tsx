'use client';

import type { ResolvedBranding } from '@/hooks/useSiteBranding';
import type { ItinerarySections } from '@/components/crm/types';
import type { BookingVoucherPayload } from '@/lib/crm-catalog';
import { countDaysBetween, countNightsBetween, nightStayForDay } from '@/lib/itinerary-utils';
import ItineraryPdfPolicies from './ItineraryPdfPolicies';
import type { DestinationDetail } from '../itinerary/DestinationDayCards';
import { resolvePdfHeroImage } from '@/lib/pdf-branding';

export type ItineraryPdfHotel = {
  id: string;
  name: string;
  location: string | null;
  category: string | null;
  hotel_type: string | null;
  featured_image_url?: string | null;
};

export type ItineraryPdfProps = {
  branding: ResolvedBranding;
  itin: Record<string, unknown>;
  sections: ItinerarySections;
  hotelsById: Map<string, ItineraryPdfHotel>;
  assets: { id: string; image_url: string; caption: string | null; after_day: number | null }[];
  destinationsById?: Map<string, DestinationDetail>;
  bookingVoucher?: BookingVoucherPayload | null;
};

function padDay(n: number) {
  return String(n).padStart(2, '0');
}

function getDeduplicatedDayParagraphs(
  dayBody: string | null | undefined,
  destinations: DestinationDetail[],
  seenGlobalNorms: Set<string>
): string[] {
  const norm = (s: string) => (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const daySeen = new Set<string>();
  const paragraphs: string[] = [];
  const rawCandidateStrings: string[] = [];

  if (dayBody && dayBody.trim()) {
    const splits = dayBody.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    rawCandidateStrings.push(...splits);
  }

  for (const dest of destinations) {
    if (dest.description && dest.description.trim()) {
      const splits = dest.description.split(/\n+/).map((s) => s.trim()).filter(Boolean);
      rawCandidateStrings.push(...splits);
    }
  }

  for (const raw of rawCandidateStrings) {
    let clean = raw.trim();
    if (!clean) continue;

    // Check if line is just a title or label ending in colon matching a destination name
    const isHeaderOnly = destinations.some(
      (dest) =>
        norm(clean).replace(/:$/, '') === norm(dest.name) ||
        norm(clean).replace(/:$/, '').startsWith(norm(dest.name))
    );
    if (isHeaderOnly && (clean.endsWith(':') || clean.length < 120)) {
      continue;
    }

    // Strip redundant leading prefixes like "Destination Name (...): Actual text"
    const colonMatch = clean.match(/^([A-Za-z0-9\s/→–—()\-]+):\s+(.+)$/);
    if (colonMatch && colonMatch[2]) {
      const prefixNorm = norm(colonMatch[1]);
      const isPrefixDest = destinations.some(
        (dest) => prefixNorm.includes(norm(dest.name)) || norm(dest.name).includes(prefixNorm)
      );
      if (isPrefixDest) {
        clean = colonMatch[2].trim();
      }
    }

    const n = norm(clean);
    if (!n) continue;

    // Skip duplicate across the day or already printed in a previous day
    if (daySeen.has(n) || seenGlobalNorms.has(n)) continue;

    daySeen.add(n);
    seenGlobalNorms.add(n);
    paragraphs.push(clean);
  }

  return paragraphs;
}

export default function ProfessionalItineraryPdf({
  branding,
  itin,
  sections,
  hotelsById,
  assets,
  destinationsById = new Map(),
  bookingVoucher,
}: ItineraryPdfProps) {
  const travelStart = itin.travel_start ? String(itin.travel_start) : '';
  const travelEnd = itin.travel_end ? String(itin.travel_end) : '';
  const nights = countNightsBetween(String(itin.travel_start || ''), String(itin.travel_end || ''));
  const days = countDaysBetween(String(itin.travel_start || ''), String(itin.travel_end || ''));
  const itinNumber = itin.itinerary_number ? String(itin.itinerary_number) : String(itin.id || '').slice(0, 8);
  const quote = itin.quote_price != null ? Number(itin.quote_price) : null;
  const ps = sections.package_summary;
  const headerAssets = assets.filter((a) => a.after_day == null);
  const assetsAfterDay = (dayNum: number) => assets.filter((a) => a.after_day === dayNum);
  const bank = branding.bankDetails;

  const headerBg = resolvePdfHeroImage(branding.pdfHeaderImageUrl);

  const facts: { label: string; value: string; isRate?: boolean }[] = [
    { label: 'Guest', value: String(itin.customer_name || '—') },
    { label: 'Phone', value: String(itin.customer_phone || '—') },
    { label: 'Email', value: String(itin.customer_email || '—') },
  ];
  if (quote != null && quote > 0) facts.push({ label: 'Package Rate', value: `₹ ${quote.toLocaleString('en-IN')}`, isRate: true });
  if (ps?.pax != null) facts.push({ label: 'Pax', value: String(ps.pax) });
  if (ps?.rooms != null) facts.push({ label: 'Rooms', value: String(ps.rooms) });

  const factsClass = facts.length > 3 ? 'itin-facts itin-facts--4' : 'itin-facts';

  return (
    <div className="itin-doc itinerary-pdf-pro">
      <header className="itin-letterhead pdf-avoid-break">
        {headerBg ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={headerBg} alt="" className="itin-letterhead-bg" crossOrigin="anonymous" />
            <div className="itin-letterhead-overlay" aria-hidden />
          </>
        ) : null}
        <div className="itin-letterhead-content">
          <div className="itin-letterhead-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={branding.logoUrl} alt="" className="itin-letterhead-logo" crossOrigin="anonymous" />
            <div>
              <p className="itin-letterhead-brand">{branding.companyName}</p>
              <p className="itin-letterhead-tag">{branding.tagline}</p>
            </div>
          </div>
          <div className="itin-letterhead-right">
            <p>{branding.address}</p>
            <p>{branding.phones}</p>
            <p>{branding.email}</p>
            <p>{branding.website}</p>
          </div>
        </div>
      </header>

      <div className="itin-cover pdf-avoid-break">
        <p className="itin-cover-eyebrow">Personal travel dossier</p>
        <h1 className="itin-cover-title">{String(itin.title ?? 'Kashmir tour package')}</h1>
        <div className="itin-cover-meta">
          <span className="itin-chip">Ref #{itinNumber}</span>
          {quote != null && quote > 0 ? (
            <span className="itin-chip itin-chip--rate">Rate: ₹ {quote.toLocaleString('en-IN')}</span>
          ) : null}
          {nights > 0 ? <span className="itin-chip itin-chip--gold">{nights} nights · {days} days</span> : null}
          {travelStart ? <span className="itin-chip itin-chip--gold">From {travelStart}</span> : null}
          {travelEnd ? <span className="itin-chip itin-chip--gold">To {travelEnd}</span> : null}
        </div>
        <div className={factsClass}>
          {facts.map((f) => (
            <div key={f.label} className={`itin-fact ${f.isRate ? 'itin-fact--rate' : ''}`}>
              <div className="itin-fact-label">{f.label}</div>
              <div className="itin-fact-value" style={f.isRate ? { fontWeight: 800, color: '#0c1929' } : undefined}>
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {(sections.night_stays?.length ?? 0) > 0 ? (
        <section className="itin-section">
          <h2 className="itin-section-title">Accommodation</h2>
          <div className="itin-hotel-cards">
            {sections.night_stays
              .filter((s) => s.hotel_id)
              .map((s) => {
                const h = s.hotel_id ? hotelsById.get(s.hotel_id) : undefined;
                return (
                  <article key={s.night} className="itin-hotel-card pdf-avoid-break">
                    {h?.featured_image_url ? (
                      <div className="itin-hotel-card-img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={h.featured_image_url} alt="" crossOrigin="anonymous" />
                      </div>
                    ) : (
                      <div className="itin-hotel-card-img" aria-hidden />
                    )}
                    <div className="itin-hotel-card-body">
                      <p className="itin-hotel-night">Night {s.night}</p>
                      <p className="itin-hotel-name">{h?.name || '—'}</p>
                      {h?.location ? <p className="itin-hotel-loc">{h.location}</p> : null}
                      <p className="itin-hotel-meta">
                        {h?.category ? `${h.category} · ` : ''}
                        Room: {s.room_category || 'As per availability'} · Meal: {s.meal_plan || 'MAP'}
                      </p>
                      <p className="itin-hotel-dates">
                        {s.check_in || '—'} → {s.check_out || '—'}
                      </p>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>
      ) : null}

      {headerAssets.length > 0 ? (
        <section className="itin-section">
          <h2 className="itin-section-title">Highlights</h2>
          <div className="itin-gallery">
            {headerAssets.map((img) => (
              <div key={img.id} className="itin-gallery-item pdf-avoid-break">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image_url} alt={img.caption || ''} className="itin-gallery-img" />
                {img.caption ? <p className="itin-gallery-cap">{img.caption}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="itin-section">
        <h2 className="itin-section-title">Day-by-day plan</h2>
        <div className="itin-timeline">
          {(() => {
            const globalSeenParagraphs = new Set<string>();
            return sections.days.map((d, idx) => {
              const dayNum = d.day || idx + 1;
              const rowImgs = assetsAfterDay(dayNum);
              const destIds = d.destination_ids || [];
              const night = nightStayForDay(dayNum, sections.night_stays || []);
              const hotel = night?.hotel_id ? hotelsById.get(night.hotel_id) : undefined;

              const attachedDests = destIds
                .map((did) => destinationsById.get(did))
                .filter(Boolean) as DestinationDetail[];

              // Determine image for the day: first attached destination image, or first day row image
              const featuredImg =
                attachedDests.find((dest) => dest.featured_image_url)?.featured_image_url ||
                rowImgs[0]?.image_url;

              // Determine day title: if d.title is duplicate of previous day's title while destination is different, use destination name
              const prevDay = idx > 0 ? sections.days[idx - 1] : null;
              const normText = (s?: string | null) => (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
              const isPrevTitleDup =
                prevDay &&
                d.title &&
                prevDay.title &&
                normText(d.title) === normText(prevDay.title);
              const dayTitle =
                isPrevTitleDup && attachedDests[0]?.name
                  ? attachedDests[0].name
                  : d?.title?.trim() || attachedDests[0]?.name || `Day ${dayNum}`;

              // Build route subtitle (e.g. "Srinagar · Srinagar → Katra Airport")
              const firstDest = attachedDests[0];
              const routeSubtitle = firstDest
                ? [
                    firstDest.base_location,
                    firstDest.route_from && firstDest.route_to
                      ? `${firstDest.route_from} → ${firstDest.route_to}`
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : '';

              // Get deduplicated paragraphs so text NEVER comes twice
              const paragraphs = getDeduplicatedDayParagraphs(d?.body, attachedDests, globalSeenParagraphs);

              // Filter out rowImgs that are already featured
              const normUrl = (u?: string | null) =>
                (u || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
              const featuredNorm = normUrl(featuredImg);
              const hotelNorm = normUrl(hotel?.featured_image_url);
              const extraPhotos = rowImgs.filter((img) => {
                const u = normUrl(img.image_url);
                return u && u !== featuredNorm && u !== hotelNorm;
              });

              return (
                <div key={idx} className="itin-day-card pdf-avoid-break">
                  <div className="itin-day-card-header">
                    <div className="itin-day-badge">Day {padDay(dayNum)}</div>
                    <div className="itin-day-header-text">
                      <h3 className="itin-day-title">{dayTitle}</h3>
                      {routeSubtitle ? <p className="itin-day-route">{routeSubtitle}</p> : null}
                    </div>
                  </div>

                  <div className="itin-day-card-content">
                    {featuredImg ? (
                      <div className="itin-day-card-img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={featuredImg} alt="" crossOrigin="anonymous" />
                      </div>
                    ) : null}

                    <div className="itin-day-card-text">
                      {paragraphs.length > 0 ? (
                        paragraphs.map((p, pIdx) => (
                          <p key={pIdx} className="itin-day-para">
                            {p}
                          </p>
                        ))
                      ) : (
                        <p className="itin-day-para text-slate-400 italic">Day details will be provided during travel.</p>
                      )}
                    </div>
                  </div>

                  {hotel && night ? (
                    <div className="itin-day-card-stay">
                      {hotel.featured_image_url ? (
                        <div className="itin-day-card-stay-img">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={hotel.featured_image_url} alt="" crossOrigin="anonymous" />
                        </div>
                      ) : null}
                      <div>
                        <span className="itin-stay-label">Overnight · Night {night.night}: </span>
                        <strong className="itin-stay-name">{hotel.name}</strong>
                        <span className="itin-hotel-meta">
                          {hotel.location ? ` (${hotel.location})` : ''} · {night.room_category || 'Room TBC'} · {night.meal_plan || 'MAP'}
                          {night.check_in && night.check_out ? ` · ${night.check_in} → ${night.check_out}` : ''}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {extraPhotos.length > 0 ? (
                    <div className="itin-day-photos">
                      {extraPhotos.map((img) => (
                        <div key={img.id} className="itin-day-photo">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.image_url} alt={img.caption || ''} />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            });
          })()}
        </div>
      </section>

      <section className="itin-section">
        <h2 className="itin-section-title">Package details</h2>
        <div className="itin-inc-grid">
          <div className="itin-inc-box itin-inc-box--yes pdf-avoid-break">
            <h3 className="itin-inc-head">Included</h3>
            <ul className="itin-inc-list">
              {(sections.inclusions.length > 0 ? sections.inclusions : ['As per agreed package']).map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="itin-inc-box itin-inc-box--no pdf-avoid-break">
            <h3 className="itin-inc-head">Not included</h3>
            <ul className="itin-inc-list">
              {(sections.exclusions.length > 0 ? sections.exclusions : ['See quotation']).map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
        {sections.transfers ? (
          <div className="itin-transfers">
            <p className="itin-transfers-title">Transfers &amp; transport</p>
            <p className="itin-day-body">{sections.transfers}</p>
            {bookingVoucher?.cab_name ? (
              <p className="itin-hotel-meta" style={{ marginTop: 6 }}>
                Cab: {bookingVoucher.cab_name}
                {bookingVoucher.cab_driver ? ` · Driver: ${bookingVoucher.cab_driver}` : ''}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <ItineraryPdfPolicies sections={sections} />

      <footer className="itin-pay-footer pdf-avoid-break">
        <h2 className="itin-pay-title">Payment information</h2>
        {bank && (bank.accountNumber || bank.upiId) ? (
          <dl className="itin-pay-grid">
            {bank.accountName ? (
              <>
                <dt>Account name</dt>
                <dd>{bank.accountName}</dd>
              </>
            ) : null}
            {bank.bankName ? (
              <>
                <dt>Bank</dt>
                <dd>{bank.bankName}</dd>
              </>
            ) : null}
            {bank.accountNumber ? (
              <>
                <dt>Account no.</dt>
                <dd>{bank.accountNumber}</dd>
              </>
            ) : null}
            {bank.ifsc ? (
              <>
                <dt>IFSC</dt>
                <dd>{bank.ifsc}</dd>
              </>
            ) : null}
            {bank.branch ? (
              <>
                <dt>Branch</dt>
                <dd>{bank.branch}</dd>
              </>
            ) : null}
            {bank.upiId ? (
              <>
                <dt>UPI</dt>
                <dd>{bank.upiId}</dd>
              </>
            ) : null}
          </dl>
        ) : (
          <p className="itin-pay-thanks">Configure bank details in Admin → Home media → Branding.</p>
        )}
        <p className="itin-pay-thanks">
          Thank you for choosing {branding.companyName}. {branding.address}
        </p>
      </footer>
    </div>
  );
}
