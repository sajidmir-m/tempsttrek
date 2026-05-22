'use client';

import type { ResolvedBranding } from '@/hooks/useSiteBranding';

export type CrmPdfDocKind = 'INVOICE' | 'ITINERARY' | 'VOUCHER';

export function CrmPdfBrandedHeaderStyles() {
  return (
    <style>{`
      .crm-pdf-branded-header {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 0 0 14px;
        margin-bottom: 14px;
        border-bottom: 2px solid #111;
        text-align: left;
      }
      .crm-pdf-branded-logo {
        width: 52px;
        height: 52px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .crm-pdf-branded-body { flex: 1; min-width: 0; }
      .crm-pdf-branded-name {
        margin: 0;
        font-size: 16px;
        font-weight: 900;
        color: #0a0a0a;
        letter-spacing: -0.02em;
        line-height: 1.25;
      }
      .crm-pdf-branded-kind {
        margin: 3px 0 0;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #404040;
      }
      .crm-pdf-branded-tag {
        margin: 4px 0 0;
        font-size: 11px;
        font-weight: 600;
        color: #525252;
      }
      .crm-pdf-branded-lines {
        margin-top: 8px;
        font-size: 11px;
        font-weight: 600;
        line-height: 1.5;
        color: #262626;
      }
      .crm-pdf-branded-lines p { margin: 0 0 3px; }
    `}</style>
  );
}

export default function CrmPdfBrandedHeader({
  branding,
  docKind,
  tagline,
}: {
  branding: ResolvedBranding;
  docKind: CrmPdfDocKind;
  tagline?: string;
}) {
  return (
    <header className="crm-pdf-branded-header pdf-avoid-break">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={branding.logoUrl} alt="" width={52} height={52} className="crm-pdf-branded-logo" crossOrigin="anonymous" />
      <div className="crm-pdf-branded-body">
        <p className="crm-pdf-branded-name">{branding.companyName}</p>
        <p className="crm-pdf-branded-kind">{docKind}</p>
        <p className="crm-pdf-branded-tag">{tagline || branding.tagline}</p>
        <div className="crm-pdf-branded-lines">
          <p>{branding.address}</p>
          <p>
            <strong>Email:</strong> {branding.email} · <strong>Phone:</strong> {branding.phones}
          </p>
          <p>
            <strong>Website:</strong> {branding.website}
          </p>
        </div>
      </div>
    </header>
  );
}
