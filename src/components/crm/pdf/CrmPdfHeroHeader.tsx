'use client';

import type { ResolvedBranding } from '@/hooks/useSiteBranding';
import { resolvePdfHeroImage } from '@/lib/pdf-branding';
import type { CrmPdfDocKind } from './CrmPdfBrandedHeader';

export function CrmPdfHeroHeaderStyles() {
  return (
    <style>{`
      .crm-pdf-hero {
        position: relative;
        min-height: 168px;
        overflow: hidden;
        margin-bottom: 16px;
        border-radius: 10px;
        background-color: #0c1f2d !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .crm-pdf-hero-bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        z-index: 1;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .crm-pdf-hero-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(6, 32, 48, 0.65);
        background: linear-gradient(105deg, rgba(6, 32, 48, 0.88) 0%, rgba(6, 32, 48, 0.55) 55%, rgba(6, 32, 48, 0.35) 100%);
        z-index: 2;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .crm-pdf-hero-content {
        position: relative;
        z-index: 3;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 20px 18px;
        color: #fff;
        text-align: left;
      }
      .crm-pdf-hero-logo {
        width: 56px;
        height: 56px;
        object-fit: contain;
        flex-shrink: 0;
        background: rgba(255,255,255,0.95);
        border-radius: 8px;
        padding: 4px;
      }
      .crm-pdf-hero-text { flex: 1; min-width: 0; }
      .crm-pdf-hero-company {
        margin: 0;
        font-size: 17px;
        font-weight: 900;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }
      .crm-pdf-hero-kind {
        margin: 4px 0 0;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        opacity: 0.95;
      }
      .crm-pdf-hero-tag {
        margin: 6px 0 0;
        font-size: 11px;
        font-weight: 600;
        opacity: 0.9;
        line-height: 1.45;
      }
      .crm-pdf-hero-contact {
        margin: 8px 0 0;
        font-size: 10px;
        font-weight: 600;
        line-height: 1.5;
        opacity: 0.92;
      }
      .crm-pdf-hero-contact p { margin: 0 0 2px; }
    `}</style>
  );
}

export default function CrmPdfHeroHeader({
  branding,
  docKind,
  subtitle,
}: {
  branding: ResolvedBranding;
  docKind: CrmPdfDocKind;
  subtitle?: string;
}) {
  const bg = resolvePdfHeroImage(branding.pdfHeaderImageUrl);
  return (
    <header className="crm-pdf-hero pdf-avoid-break pdf-keep-together">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bg} alt="" className="crm-pdf-hero-bg" crossOrigin="anonymous" />
      <div className="crm-pdf-hero-overlay" aria-hidden />
      <div className="crm-pdf-hero-content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={branding.logoUrl} alt="" width={56} height={56} className="crm-pdf-hero-logo" crossOrigin="anonymous" />
        <div className="crm-pdf-hero-text">
          <p className="crm-pdf-hero-company">{branding.companyName}</p>
          <p className="crm-pdf-hero-kind">{docKind}</p>
          <p className="crm-pdf-hero-tag">{subtitle || branding.tagline}</p>
          <div className="crm-pdf-hero-contact">
            <p>{branding.address}</p>
            <p>
              {branding.email} · {branding.phones} · {branding.website}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
