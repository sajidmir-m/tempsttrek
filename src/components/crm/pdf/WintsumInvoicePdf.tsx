'use client';

import { formatInr } from '@/lib/ledger-utils';
import type { ResolvedBranding } from '@/hooks/useSiteBranding';
import CrmPdfHeroHeader from './CrmPdfHeroHeader';

export type WintsumInvoiceData = {
  invoice_number: string;
  customer_name: string;
  issue_date: string;
  amount: number;
  advance_paid: number;
  status: string;
};

function formatDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function WintsumInvoicePdf({
  inv,
  branding,
}: {
  inv: WintsumInvoiceData;
  branding: ResolvedBranding;
}) {
  const advance = Number(inv.advance_paid) || 0;
  const total = Number(inv.amount) || 0;
  const balance = Math.max(0, total - advance);

  return (
    <div className="crm-pdf-doc">
      <CrmPdfHeroHeader
        branding={branding}
        docKind="INVOICE"
        subtitle={`Invoice ${inv.invoice_number}`}
      />

      <p className="crm-pdf-blurb pdf-keep-together">{branding.tagline}</p>

      <section className="crm-pdf-card pdf-keep-together">
        <h2 className="crm-pdf-section-title">Invoice details</h2>
        <div className="crm-pdf-kv-grid">
          <div className="crm-pdf-kv">
            <span className="crm-pdf-k">Invoice number</span>
            <span className="crm-pdf-v">{inv.invoice_number}</span>
          </div>
          <div className="crm-pdf-kv">
            <span className="crm-pdf-k">Customer</span>
            <span className="crm-pdf-v">{inv.customer_name}</span>
          </div>
          <div className="crm-pdf-kv">
            <span className="crm-pdf-k">Invoice date</span>
            <span className="crm-pdf-v">{formatDate(inv.issue_date)}</span>
          </div>
          <div className="crm-pdf-kv">
            <span className="crm-pdf-k">Status</span>
            <span className="crm-pdf-v capitalize">{inv.status}</span>
          </div>
        </div>
      </section>

      <section className="crm-pdf-pay-card pdf-keep-together">
        <h2 className="crm-pdf-section-title">Payment summary</h2>
        <div className="crm-pdf-pay-line">
          <span>Total amount</span>
          <strong>{formatInr(total)}</strong>
        </div>
        <div className="crm-pdf-pay-line">
          <span>Advance paid</span>
          <strong>{formatInr(advance)}</strong>
        </div>
        <div className="crm-pdf-pay-line crm-pdf-pay-balance">
          <span>Balance due</span>
          <strong>{formatInr(balance)}</strong>
        </div>
      </section>

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

/** @deprecated Use CrmPdfDocumentStyles + CrmPdfHeroHeaderStyles */
export function WintsumInvoicePdfStyles() {
  return null;
}
