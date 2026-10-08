'use client';

import { formatInr } from '@/lib/ledger-utils';
import type { BookingVoucherPayload, BookingVoucherStay } from '@/lib/crm-catalog';
import type { ResolvedBranding } from '@/hooks/useSiteBranding';
import CrmPdfHeroHeader from './CrmPdfHeroHeader';

export type WintsumVoucherSource = {
  booking_id: string;
  customer_name: string;
  booking_date: string;
  payload: BookingVoucherPayload;
  total_amount?: number;
  advance_paid?: number;
};

function pad2(n: number | undefined) {
  if (n == null || Number.isNaN(n)) return '—';
  return String(n).padStart(2, '0');
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function paymentTone(status: string) {
  const s = (status || 'pending').toLowerCase();
  if (s === 'paid') return 'Paid';
  if (s === 'partial') return 'Partial';
  return 'Pending';
}

function StayTable({ stays }: { stays: BookingVoucherStay[] }) {
  return (
    <table className="crm-pdf-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Check-in</th>
          <th>Check-out</th>
          <th>Destination</th>
          <th>Type</th>
          <th>Property</th>
          <th>Room</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {stays.length > 0 ? (
          stays.map((row, i) => (
            <tr key={i} className="pdf-keep-together">
              <td>{i + 1}</td>
              <td>{formatDate(row.check_in)}</td>
              <td>{formatDate(row.check_out)}</td>
              <td>{row.destination}</td>
              <td>{row.acc_type}</td>
              <td>
                <strong>{row.acc_name}</strong>
              </td>
              <td>{row.room_category || '—'}</td>
              <td>{row.status || 'Confirmed'}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={8} style={{ textAlign: 'center', color: '#6b7280', padding: 16 }}>
              No stays — import from itinerary in Manage Voucher.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default function WintsumBookingVoucherPdf({
  data,
  branding,
}: {
  data: WintsumVoucherSource;
  branding: ResolvedBranding;
}) {
  const p = data.payload;
  const stays = p.accommodations || [];
  const total = Number(data.total_amount ?? p.total_amount) || 0;
  const advance = Number(data.advance_paid ?? p.advance_paid) || 0;
  const balance = Math.max(0, total - advance);

  return (
    <div className="crm-pdf-doc">
      <CrmPdfHeroHeader branding={branding} docKind="VOUCHER" subtitle={`Booking ${data.booking_id}`} />

      <section className="crm-pdf-card pdf-keep-together">
        <h2 className="crm-pdf-section-title">Guest &amp; booking</h2>
        <div className="crm-pdf-kv-grid">
          <div className="crm-pdf-kv">
            <span className="crm-pdf-k">Guest name</span>
            <span className="crm-pdf-v">{data.customer_name}</span>
          </div>
          <div className="crm-pdf-kv">
            <span className="crm-pdf-k">Voucher ID</span>
            <span className="crm-pdf-v" style={{ fontFamily: 'ui-monospace, monospace' }}>
              {data.booking_id}
            </span>
          </div>
          <div className="crm-pdf-kv">
            <span className="crm-pdf-k">Booking date</span>
            <span className="crm-pdf-v">{formatDate(data.booking_date)}</span>
          </div>
          <div className="crm-pdf-kv">
            <span className="crm-pdf-k">Meal plan</span>
            <span className="crm-pdf-v">{p.meal_plan || '—'}</span>
          </div>
          {total > 0 && (
            <div className="crm-pdf-kv">
              <span className="crm-pdf-k">Total rate</span>
              <span className="crm-pdf-v" style={{ fontWeight: 700 }}>
                {formatInr(total)}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="crm-pdf-card pdf-keep-together">
        <h2 className="crm-pdf-section-title">Occupancy</h2>
        <div className="crm-pdf-kv-grid">
          <div className="crm-pdf-kv">
            <span className="crm-pdf-k">Pax</span>
            <span className="crm-pdf-v">{pad2(p.pax)}</span>
          </div>
          <div className="crm-pdf-kv">
            <span className="crm-pdf-k">Rooms</span>
            <span className="crm-pdf-v">{pad2(p.rooms)}</span>
          </div>
          <div className="crm-pdf-kv">
            <span className="crm-pdf-k">Nights</span>
            <span className="crm-pdf-v">{pad2(p.nights)}</span>
          </div>
          <div className="crm-pdf-kv">
            <span className="crm-pdf-k">Extra beds</span>
            <span className="crm-pdf-v">{pad2(p.extra_beds)}</span>
          </div>
        </div>
      </section>

      <section className="pdf-keep-together">
        <h2 className="crm-pdf-section-title">Accommodation schedule</h2>
        <StayTable stays={stays} />
      </section>

      {(p.cab_name || p.cab_driver) && (
        <section className="crm-pdf-card pdf-keep-together">
          <h2 className="crm-pdf-section-title">Transport</h2>
          <p style={{ margin: '4px 0', fontSize: 12 }}>
            <strong>Cab:</strong> {p.cab_name || '—'}
          </p>
          <p style={{ margin: '4px 0', fontSize: 12 }}>
            <strong>Driver:</strong> {p.cab_driver || '—'}
            {p.cab_contact ? ` · ${p.cab_contact}` : ''}
          </p>
        </section>
      )}

      {total > 0 && (
        <section className="crm-pdf-pay-card pdf-keep-together">
          <h2 className="crm-pdf-section-title">Payment summary</h2>
          <div className="crm-pdf-pay-line">
            <span style={{ fontWeight: 700 }}>Package total</span>
            <strong style={{ fontWeight: 800 }}>{formatInr(total)}</strong>
          </div>
          <div className="crm-pdf-pay-line">
            <span style={{ fontWeight: 700 }}>Advance received</span>
            <strong style={{ fontWeight: 800 }}>{formatInr(advance)}</strong>
          </div>
          <div className="crm-pdf-pay-line crm-pdf-pay-balance">
            <span style={{ fontWeight: 700 }}>Balance due</span>
            <strong style={{ fontWeight: 800 }}>{formatInr(balance)}</strong>
          </div>
          <p style={{ fontSize: 11, marginTop: 8, fontWeight: 700 }}>
            Status: {paymentTone(p.payment_status || 'pending')}
          </p>
        </section>
      )}

      {p.terms_conditions ? (
        <section className="crm-pdf-card">
          <div className="pdf-keep-together">
            <h2 className="crm-pdf-section-title">Terms &amp; conditions</h2>
          </div>
          <p style={{ fontSize: 10, lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>{p.terms_conditions}</p>
        </section>
      ) : null}

      <footer className="crm-pdf-footer pdf-keep-together">
        <p>Thank you for choosing {branding.companyName}.</p>
        <p>{branding.address}</p>
        <p>
          {branding.phones} · {branding.email}
        </p>
      </footer>
    </div>
  );
}

/** @deprecated Use CrmPdfDocumentStyles */
export function WintsumBookingVoucherPdfStyles() {
  return null;
}
