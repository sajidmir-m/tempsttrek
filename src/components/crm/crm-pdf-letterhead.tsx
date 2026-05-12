import { SITE_BRAND, SITE_CONTACT, companyPhonesDisplayLine } from '@/lib/site-contact';

/** Styles for CrmPdfLetterhead — inject on print pages next to itinerary/invoice PDF styles. */
export function CrmPdfLetterheadStyles() {
  return (
    <style>{`
      .crm-pdf-letterhead {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 14px 0 16px;
        border-bottom: 2px solid var(--pdf-border, #171717);
        margin-bottom: 10px;
      }
      .crm-pdf-letterhead-logo {
        width: 56px;
        height: 56px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .crm-pdf-letterhead-body { flex: 1; min-width: 0; }
      .crm-pdf-letterhead-name {
        margin: 0;
        font-size: 15px;
        font-weight: 900;
        color: var(--pdf-ink, #0a0a0a);
        letter-spacing: -0.02em;
        line-height: 1.25;
      }
      .crm-pdf-letterhead-sub {
        margin: 4px 0 0;
        font-size: 11px;
        font-weight: 700;
        color: var(--pdf-muted, #525252);
      }
      .crm-pdf-letterhead-lines {
        margin-top: 10px;
        font-size: 11px;
        font-weight: 600;
        line-height: 1.5;
        color: var(--pdf-body, #262626);
      }
      .crm-pdf-letterhead-lines p { margin: 0 0 4px; }
    `}</style>
  );
}

export function CrmPdfLetterhead({ subtitle }: { subtitle: string }) {
  const phones = companyPhonesDisplayLine();
  return (
    <div className="crm-pdf-letterhead pdf-avoid-break">
      {/* eslint-disable-next-line @next/next/no-img-element -- print/PDF capture */}
      <img src="/logo.png" alt="" width={56} height={56} className="crm-pdf-letterhead-logo" />
      <div className="crm-pdf-letterhead-body">
        <p className="crm-pdf-letterhead-name">{SITE_BRAND.legalName}</p>
        <p className="crm-pdf-letterhead-sub">{subtitle}</p>
        <div className="crm-pdf-letterhead-lines">
          <p>{SITE_CONTACT.address}</p>
          <p>
            <span style={{ fontWeight: 800 }}>Email:</span> {SITE_CONTACT.email}
          </p>
          <p>
            <span style={{ fontWeight: 800 }}>Phone:</span> {phones}
          </p>
        </div>
      </div>
    </div>
  );
}
