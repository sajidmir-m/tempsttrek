import { SITE_BRAND, SITE_CONTACT, companyPhonesDisplayLine } from '@/lib/site-contact';
import {
  formatVoucherDate,
  parseVoucherPayload,
  voucherExclusions,
  voucherInclusions,
  voucherStatusConfirmed,
  voucherStatusLabel,
  type VoucherStayRow,
} from '@/lib/invoice-voucher-data';

type InvoiceRow = {
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  amount: number;
  status: string;
  issue_date: string;
  notes: string | null;
};

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="hv-field">
      <span className="hv-field-label">{label}</span>
      <span className="hv-field-value">{value}</span>
    </div>
  );
}

function StayRow({ row, index }: { row: VoucherStayRow; index: number }) {
  return (
    <tr>
      <td>{index + 1}</td>
      <td>{row.destination}</td>
      <td>{row.checkIn}</td>
      <td>{row.checkOut}</td>
      <td>{row.hotel}</td>
      <td>{row.roomCategory}</td>
      <td>{row.nights}</td>
    </tr>
  );
}

export default function HotelVoucherPdf({ inv }: { inv: InvoiceRow }) {
  const payload = parseVoucherPayload(inv.notes);
  const plainNotes = payload ? null : inv.notes?.trim() || null;
  const statusLabel = voucherStatusLabel(inv.status);
  const confirmed = voucherStatusConfirmed(inv.status);
  const stays = payload?.stays ?? [];
  const inclusions = voucherInclusions(payload);
  const exclusions = voucherExclusions(payload);
  const phones = companyPhonesDisplayLine();

  const guestName = inv.customer_name.toUpperCase();
  const mealPlan = payload?.mealPlan ?? '—';
  const pax = payload?.pax != null ? String(payload.pax).padStart(2, '0') : '—';
  const rooms = payload?.rooms != null ? String(payload.rooms).padStart(2, '0') : '—';
  const extraBeds = payload?.extraBeds != null ? String(payload.extraBeds).padStart(2, '0') : '00';
  const childNoBed = payload?.childWithoutBed != null ? String(payload.childWithoutBed).padStart(2, '0') : '00';
  const nights = payload?.nights != null ? String(payload.nights).padStart(2, '0') : '—';

  const cabName = payload?.cab?.name ?? '—';
  const cabDriver = payload?.cab?.driver ?? '—';
  const cabContact = payload?.cab?.contact ?? '—';

  return (
    <div className="hv-doc">
      <header className="hv-header pdf-avoid-break">
        {/* eslint-disable-next-line @next/next/no-img-element -- PDF raster */}
        <img src="/gem.png" alt="" className="hv-header-bg" crossOrigin="anonymous" />
        <div className="hv-header-overlay" aria-hidden />
        <div className="hv-header-inner">
          <div className="hv-header-top">
            <div className="hv-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" width={72} height={72} className="hv-logo" crossOrigin="anonymous" />
              <div>
                <p className="hv-brand-name">{SITE_BRAND.shortName.toUpperCase()}</p>
                <p className="hv-brand-tag">{SITE_BRAND.tagline}</p>
              </div>
            </div>
            <div className="hv-contact">
              <p>📞 {phones}</p>
              <p>✉ {SITE_CONTACT.email}</p>
              <p>📍 {SITE_CONTACT.address}</p>
              <p>🌐 www.tempesttreks.in</p>
            </div>
          </div>
          <div className="hv-title-wrap">
            <span className="hv-title-line" aria-hidden />
            <h1 className="hv-title">HOTEL VOUCHER</h1>
            <span className="hv-title-line" aria-hidden />
          </div>
          <p className="hv-quote">
            &ldquo;Forget not that the earth delights to feel your bare feet and the winds long to play with your
            hair.&rdquo;
          </p>
        </div>
      </header>

      <div className="hv-info-bar pdf-avoid-break" role="presentation">
        <div className="hv-info-item">
          <span className="hv-info-label">Booking date</span>
          <span className="hv-info-value">{formatVoucherDate(inv.issue_date)}</span>
        </div>
        <div className="hv-info-item">
          <span className="hv-info-label">Voucher ID</span>
          <span className="hv-info-value">{inv.invoice_number}</span>
        </div>
        <div className="hv-info-item">
          <span className="hv-info-label">Voucher status</span>
          <span className={confirmed ? 'hv-info-value hv-status-confirmed' : 'hv-info-value'}>{statusLabel}</span>
        </div>
      </div>

      <div className="hv-panels pdf-avoid-break">
        <section className="hv-panel">
          <h2 className="hv-panel-head">Guest details</h2>
          <div className="hv-panel-body">
            <FieldRow label="Guest name" value={guestName} />
            <FieldRow label="Meal plan" value={mealPlan} />
            <FieldRow label="Number of pax" value={pax} />
            {inv.customer_email ? <FieldRow label="Email" value={inv.customer_email} /> : null}
          </div>
        </section>
        <section className="hv-panel">
          <h2 className="hv-panel-head">Accommodation details</h2>
          <div className="hv-panel-body">
            <FieldRow label="Number of rooms" value={rooms} />
            <FieldRow label="Extra beds" value={extraBeds} />
            <FieldRow label="Child without bed" value={childNoBed} />
            <FieldRow label="Number of nights" value={nights} />
          </div>
        </section>
      </div>

      <div className="hv-table-wrap pdf-avoid-break">
        <table className="hv-table">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Destination</th>
              <th>Check in</th>
              <th>Check out</th>
              <th>Hotel / houseboat</th>
              <th>Room category</th>
              <th>Nights</th>
            </tr>
          </thead>
          <tbody>
            {stays.length > 0 ? (
              stays.map((row, i) => <StayRow key={i} row={row} index={i} />)
            ) : (
              <tr>
                <td colSpan={7} className="hv-table-empty">
                  Add stay rows in invoice notes as JSON (<code>stays</code> array).
                  {plainNotes ? (
                    <>
                      <br />
                      <span className="hv-table-note">{plainNotes}</span>
                    </>
                  ) : null}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="hv-cab pdf-avoid-break">
        <h2 className="hv-cab-head">Cab details</h2>
        <div className="hv-cab-body">
          <div className="hv-cab-cols">
            <FieldRow label="Cab" value={cabName} />
            <FieldRow label="Driver" value={cabDriver} />
            <FieldRow label="Contact" value={cabContact} />
          </div>
          <svg className="hv-cab-art" viewBox="0 0 200 80" aria-hidden>
            <path
              d="M20 55h140l12-22h28l8 22h12v12H20V55zm24-8h88l10-18H44l-10 18zm20 20a8 8 0 1 0 0.01 0zm56 0a8 8 0 1 0 0.01 0z"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
            />
          </svg>
        </div>
      </section>

      <div className="hv-terms pdf-avoid-break">
        <section className="hv-term-box">
          <h2 className="hv-term-head">Inclusions</h2>
          <ul>
            {inclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="hv-term-box hv-term-box--rel">
          <h2 className="hv-term-head">Exclusions</h2>
          <ul>
            {exclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {confirmed ? <div className="hv-stamp">CONFIRMED</div> : null}
        </section>
      </div>

      <footer className="hv-footer">
        <p>{SITE_BRAND.fullName}</p>
        <p>
          Package amount (CRM): ₹
          {Number(inv.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </footer>
    </div>
  );
}
