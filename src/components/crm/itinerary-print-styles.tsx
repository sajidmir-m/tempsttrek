/** Shared print + screen styles for CRM itinerary PDF (high contrast for Save as PDF). */
export function ItineraryPrintStyles() {
  return (
    <style>{`
      .itinerary-pdf-root {
        --pdf-ink: #0a0a0a;
        --pdf-body: #262626;
        --pdf-muted: #404040;
        --pdf-brand: #0f766e;
        --pdf-brand-dark: #115e59;
        --pdf-border: #171717;
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: var(--pdf-ink);
        background: #fff;
      }
      .itinerary-pdf-root * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .pdf-avoid-break {
        page-break-inside: avoid;
      }
      .itinerary-pdf-brandbar {
        background: linear-gradient(90deg, var(--pdf-brand-dark) 0%, var(--pdf-brand) 100%);
        color: #fff;
        padding: 14px 20px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }
      .itinerary-pdf-title {
        font-size: 26px;
        font-weight: 900;
        color: var(--pdf-ink);
        line-height: 1.2;
        margin: 20px 0 8px;
        letter-spacing: -0.02em;
      }
      .itinerary-pdf-sub {
        font-size: 14px;
        font-weight: 600;
        color: var(--pdf-body);
      }
      .itinerary-pdf-meta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        border: 2px solid var(--pdf-border);
        margin-top: 18px;
      }
      .itinerary-pdf-meta-cell {
        padding: 12px 16px;
        border: 1px solid #525252;
        min-height: 56px;
      }
      .itinerary-pdf-meta-label {
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--pdf-brand-dark);
        margin-bottom: 4px;
      }
      .itinerary-pdf-meta-value {
        font-size: 13px;
        font-weight: 600;
        color: var(--pdf-ink);
        line-height: 1.4;
      }
      .itinerary-pdf-section {
        margin-top: 28px;
      }
      .itinerary-pdf-section-head {
        background: var(--pdf-brand);
        color: #fff;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        padding: 11px 16px;
        margin: 0 0 12px;
      }
      .itinerary-pdf-day {
        border: 2px solid var(--pdf-brand);
        padding: 14px 16px 16px;
        margin-bottom: 12px;
        page-break-inside: avoid;
        background: #fafafa;
      }
      .itinerary-pdf-day + .itinerary-pdf-day {
        margin-top: 0;
      }
      .itinerary-pdf-dayblock {
        margin-bottom: 14px;
      }
      .itinerary-pdf-dayblock .itinerary-pdf-day {
        margin-bottom: 0;
      }
      .itinerary-pdf-daynum {
        font-size: 11px;
        font-weight: 900;
        color: var(--pdf-brand-dark);
        letter-spacing: 0.12em;
      }
      .itinerary-pdf-daytitle {
        font-size: 16px;
        font-weight: 800;
        color: var(--pdf-ink);
        margin-top: 6px;
      }
      .itinerary-pdf-daybody {
        font-size: 13px;
        line-height: 1.6;
        color: var(--pdf-body);
        margin-top: 10px;
        white-space: pre-wrap;
      }
      .itinerary-pdf-two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
        border: 2px solid var(--pdf-border);
        border-top: none;
      }
      .itinerary-pdf-col {
        padding: 14px 16px 18px;
        border-right: 1px solid #525252;
      }
      .itinerary-pdf-col:last-child {
        border-right: none;
      }
      .itinerary-pdf-col h4 {
        margin: 0 0 10px;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--pdf-brand-dark);
      }
      .itinerary-pdf-ul {
        margin: 0;
        padding-left: 18px;
        font-size: 12.5px;
        line-height: 1.55;
        color: var(--pdf-ink);
      }
      .itinerary-pdf-ul li {
        margin-bottom: 6px;
      }
      .itinerary-pdf-note {
        font-size: 12.5px;
        line-height: 1.55;
        color: var(--pdf-ink);
        white-space: pre-wrap;
        padding: 14px 16px;
        border: 2px solid var(--pdf-border);
        border-top: none;
      }
      .itinerary-pdf-footer {
        margin-top: 28px;
        padding-top: 16px;
        border-top: 2px solid var(--pdf-border);
        font-size: 11px;
        font-weight: 600;
        color: var(--pdf-muted);
      }
      .itinerary-pdf-images {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 12px;
        border: 2px solid var(--pdf-border);
        border-top: none;
      }
      .itinerary-pdf-images-inline {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed #a3a3a3;
      }
      .itinerary-pdf-imgcell {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .itinerary-pdf-imgkind {
        font-size: 9px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--pdf-brand-dark);
      }
      .itinerary-pdf-imgcap {
        margin: 0;
        font-size: 10px;
        font-weight: 600;
        color: var(--pdf-muted);
        line-height: 1.35;
      }
      .itinerary-pdf-imgwrap {
        position: relative;
        aspect-ratio: 4/3;
        border: 1px solid #737373;
        overflow: hidden;
        background: #f5f5f5;
      }
      .itinerary-pdf-imgwrap--sm {
        max-height: 140px;
        aspect-ratio: 4/3;
      }
      @media print {
        .itinerary-pdf-root {
          font-size: 11pt;
        }
        .itinerary-pdf-title {
          font-size: 22pt;
        }
      }
      @media (max-width: 640px) {
        .itinerary-pdf-meta,
        .itinerary-pdf-two-col {
          grid-template-columns: 1fr;
        }
        .itinerary-pdf-images-inline {
          grid-template-columns: 1fr 1fr;
        }
        .itinerary-pdf-col {
          border-right: none;
          border-bottom: 1px solid #525252;
        }
        .itinerary-pdf-col:last-child {
          border-bottom: none;
        }
      }
    `}</style>
  );
}
