'use client';

import type { ResolvedBranding } from '@/hooks/useSiteBranding';
import type { ItinerarySections } from '@/components/crm/types';
import type { BookingVoucherPayload } from '@/lib/crm-catalog';
import { countDaysBetween, countNightsBetween, nightStayForDay } from '@/lib/itinerary-utils';
import ItineraryPdfPolicies from './ItineraryPdfPolicies';
import type { DestinationDetail } from '../itinerary/DestinationDayCards';

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

  const facts: { label: string; value: string }[] = [
    { label: 'Guest', value: String(itin.customer_name || '—') },
    { label: 'Phone', value: String(itin.customer_phone || '—') },
    { label: 'Email', value: String(itin.customer_email || '—') },
  ];
  if (quote != null && quote > 0) facts.push({ label: 'Quote', value: `₹ ${quote.toLocaleString('en-IN')}` });
  if (ps?.pax != null) facts.push({ label: 'Pax', value: String(ps.pax) });
  if (ps?.rooms != null) facts.push({ label: 'Rooms', value: String(ps.rooms) });

  const factsClass = facts.length > 3 ? 'itin-facts itin-facts--4' : 'itin-facts';

  return (
    <div className="itin-doc itinerary-pdf-pro">
      <header className="itin-letterhead pdf-avoid-break">
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
      </header>

      <div className="itin-cover pdf-avoid-break">
        <p className="itin-cover-eyebrow">Personal travel dossier</p>
        <h1 className="itin-cover-title">{String(itin.title ?? 'Kashmir tour package')}</h1>
        <div className="itin-cover-meta">
          <span className="itin-chip">Ref #{itinNumber}</span>
          {nights > 0 ? <span className="itin-chip itin-chip--gold">{nights} nights · {days} days</span> : null}
          {travelStart ? <span className="itin-chip itin-chip--gold">From {travelStart}</span> : null}
          {travelEnd ? <span className="itin-chip itin-chip--gold">To {travelEnd}</span> : null}
        </div>
        <div className={factsClass}>
          {facts.map((f) => (
            <div key={f.label} className="itin-fact">
              <div className="itin-fact-label">{f.label}</div>
              <div className="itin-fact-value">{f.value}</div>
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
          {sections.days.map((d, idx) => {
            const dayNum = d.day || idx + 1;
            const rowImgs = assetsAfterDay(dayNum);
            const destIds = d.destination_ids || [];
            const night = nightStayForDay(dayNum, sections.night_stays || []);
            const hotel = night?.hotel_id ? hotelsById.get(night.hotel_id) : undefined;
            return (
              <div key={idx} className="itin-timeline-item">
                <div className="itin-timeline-badge">{padDay(dayNum)}</div>
                <div className="itin-timeline-content">
                  <h3 className="itin-day-title">{d?.title?.trim() || `Day ${dayNum}`}</h3>
                  {d?.body ? <p className="itin-day-body">{d.body}</p> : null}

                  {destIds.length > 0 ? (
                    <div className="itin-dest-list">
                      {destIds.map((did) => {
                        const dest = destinationsById.get(did);
                        if (!dest) return null;
                        return (
                          <div key={did} className="itin-dest pdf-avoid-break">
                            {dest.featured_image_url ? (
                              <div className="itin-dest-img">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={dest.featured_image_url} alt="" crossOrigin="anonymous" />
                              </div>
                            ) : null}
                            <div>
                              <p className="itin-dest-name">{dest.name}</p>
                              <p className="itin-dest-route">
                                {dest.base_location}
                                {dest.route_from && dest.route_to
                                  ? ` · ${dest.route_from} → ${dest.route_to}`
                                  : ''}
                              </p>
                              {dest.description ? <p className="itin-dest-desc">{dest.description}</p> : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {hotel && night ? (
                    <div className="itin-stay pdf-avoid-break">
                      {hotel.featured_image_url ? (
                        <div className="itin-stay-img">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={hotel.featured_image_url} alt="" crossOrigin="anonymous" />
                        </div>
                      ) : null}
                      <div>
                        <p className="itin-stay-label">Overnight · Night {night.night}</p>
                        <p className="itin-stay-name">{hotel.name}</p>
                        <p className="itin-hotel-meta">
                          {hotel.location ? `${hotel.location} · ` : ''}
                          {night.room_category || 'Room TBC'} · {night.meal_plan || 'MAP'}
                        </p>
                        <p className="itin-hotel-dates">
                          {night.check_in} → {night.check_out}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {rowImgs.length > 0 ? (
                    <div className="itin-day-photos">
                      {rowImgs.map((img) => (
                        <div key={img.id} className="itin-day-photo">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.image_url} alt={img.caption || ''} />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="itin-section">
        <h2 className="itin-section-title">Package details</h2>
        <div className="itin-inc-grid">
          <div className="itin-inc-box itin-inc-box--yes pdf-avoid-break">
            <h4 className="itin-inc-head">Included</h4>
            <ul className="itin-inc-list">
              {(sections.inclusions.length > 0 ? sections.inclusions : ['As per agreed package']).map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="itin-inc-box itin-inc-box--no pdf-avoid-break">
            <h4 className="itin-inc-head">Not included</h4>
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
