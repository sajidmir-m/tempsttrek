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
        .itinerary-pdf-root:not(.itinerary-pdf-exporting) .itinerary-pdf-meta,
        .itinerary-pdf-root:not(.itinerary-pdf-exporting) .itinerary-pdf-two-col {
          grid-template-columns: 1fr;
        }
        .itinerary-pdf-root:not(.itinerary-pdf-exporting) .itinerary-pdf-images-inline {
          grid-template-columns: 1fr 1fr;
        }
        .itinerary-pdf-root:not(.itinerary-pdf-exporting) .itinerary-pdf-col {
          border-right: none;
          border-bottom: 1px solid #525252;
        }
        .itinerary-pdf-root:not(.itinerary-pdf-exporting) .itinerary-pdf-col:last-child {
          border-bottom: none;
        }
      }

      .itinerary-pdf-exporting .itinerary-pdf-export-wrap {
        width: 210mm !important;
        max-width: 210mm !important;
        min-width: 210mm !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        box-sizing: border-box;
      }
      .itinerary-pdf-exporting .itinerary-pdf-pro {
        width: 718px !important;
        max-width: 718px !important;
        margin: 0 auto;
        padding: 0 4px;
        box-sizing: border-box;
      }
      .itinerary-pdf-exporting .crm-pdf-hero {
        position: relative !important;
        min-height: 140px !important;
        height: auto !important;
        display: block !important;
        overflow: hidden !important;
        page-break-inside: avoid;
      }
      .itinerary-pdf-exporting .crm-pdf-hero-bg {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 140px !important;
      }
      .itinerary-pdf-exporting .crm-pdf-hero-overlay {
        position: absolute !important;
        inset: 0 !important;
        min-height: 140px !important;
      }
      .itinerary-pdf-exporting .crm-pdf-hero-content {
        position: relative !important;
        display: flex !important;
        flex-direction: row !important;
        align-items: flex-start !important;
        min-height: 120px !important;
      }
      .itinerary-pdf-exporting .itinerary-pdf-hotel-table-wrap {
        width: 100%;
        overflow: hidden;
      }
      .itinerary-pdf-exporting .itinerary-pdf-hotel-table {
        table-layout: fixed !important;
        width: 100% !important;
        font-size: 9px !important;
      }
      .itinerary-pdf-exporting .itinerary-pdf-hotel-table th,
      .itinerary-pdf-exporting .itinerary-pdf-hotel-table td {
        padding: 5px 6px !important;
        word-wrap: break-word;
        overflow-wrap: break-word;
        vertical-align: top;
      }
      .itinerary-pdf-exporting .itinerary-pdf-hotel-table .col-night { width: 8%; }
      .itinerary-pdf-exporting .itinerary-pdf-hotel-table .col-date { width: 14%; }
      .itinerary-pdf-exporting .itinerary-pdf-hotel-table .col-hotel { width: 32%; }
      .itinerary-pdf-exporting .itinerary-pdf-hotel-table .col-room { width: 22%; }
      .itinerary-pdf-exporting .itinerary-pdf-hotel-table .col-meal { width: 12%; }
      .itinerary-pdf-exporting .itinerary-pdf-dayblock {
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      .itinerary-pdf-exporting .itinerary-pdf-policy-unit {
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      .itinerary-pdf-exporting .itinerary-pdf-section {
        page-break-inside: auto;
      }
      .itinerary-pdf-exporting .itinerary-pdf-imgwrap {
        aspect-ratio: auto !important;
        height: auto !important;
        min-height: 72px;
      }
      .itinerary-pdf-exporting .itinerary-pdf-imgwrap--dest {
        width: 132px !important;
        height: 96px !important;
        min-height: 96px !important;
      }
      .itinerary-pdf-exporting .itinerary-pdf-imgwrap--hotel {
        width: 140px !important;
        height: 100px !important;
        min-height: 100px !important;
      }
      .itinerary-pdf-exporting .itinerary-pdf-imgwrap--sm {
        max-height: 100px !important;
        min-height: 72px !important;
      }
      .itinerary-pdf-exporting .itinerary-pdf-meta,
      .itinerary-pdf-exporting .itinerary-pdf-two-col,
      .itinerary-pdf-exporting .itinerary-pdf-images,
      .itinerary-pdf-exporting .itinerary-pdf-images-inline {
        grid-template-columns: 1fr 1fr !important;
      }
      .itinerary-pdf-exporting .itinerary-pdf-images-inline {
        grid-template-columns: 1fr 1fr 1fr !important;
      }
      .itinerary-pdf-exporting .itinerary-pdf-col {
        border-right: 1px solid #525252 !important;
        border-bottom: none !important;
      }
      .itinerary-pdf-exporting .itinerary-pdf-col:last-child {
        border-right: none !important;
      }

      .itinerary-pdf-img-fill {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .itinerary-pdf-hotel-loc {
        display: block;
        font-size: 10px;
        font-weight: 600;
        color: #525252;
        margin-top: 2px;
      }
      .itinerary-pdf-transfers {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px dashed #a3a3a3;
      }
      .itinerary-pdf-transfers-title {
        margin: 0 0 6px;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #0f766e;
      }
      .itinerary-pdf-transfers-body {
        margin: 0;
        font-size: 12px;
        line-height: 1.55;
        color: #262626;
        white-space: pre-wrap;
      }
      .itinerary-pdf-transfers-cab {
        margin: 6px 0 0;
        font-size: 12px;
        color: #404040;
      }
      .itinerary-pdf-bank-missing {
        font-size: 12px;
        color: #525252;
      }
      .itinerary-pdf-footer-line-spaced {
        margin-top: 14px;
      }
      .itinerary-pdf-hotel-type-cap {
        text-transform: capitalize;
      }

      /* Professional itinerary PDF */
      .itinerary-pdf-pro { color: #0a0a0a; background: #fff; }
      .itinerary-pdf-hero {
        position: relative;
        min-height: 200px;
        overflow: hidden;
        margin-bottom: 8px;
      }
      .itinerary-pdf-hero-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
      .itinerary-pdf-hero-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(8,28,48,0.5) 0%, rgba(8,28,48,0.85) 100%);
      }
      .itinerary-pdf-hero-content {
        position: relative;
        z-index: 1;
        padding: 24px 20px;
        color: #fff;
        text-align: center;
      }
      .itinerary-pdf-hero-logo {
        margin: 0 auto 12px;
        object-fit: contain;
        background: rgba(255,255,255,0.92);
        border-radius: 8px;
        padding: 4px;
      }
      .itinerary-pdf-hero-company { font-size: 18px; font-weight: 900; margin: 0; }
      .itinerary-pdf-hero-tag { font-size: 11px; font-weight: 700; margin: 4px 0; opacity: 0.95; }
      .itinerary-pdf-hero-contact, .itinerary-pdf-hero-address { font-size: 11px; margin: 2px 0; }
      .itinerary-pdf-banner {
        margin: 0 0 12px;
        border-radius: 8px;
        overflow: hidden;
        max-height: 100px;
      }
      .itinerary-pdf-banner-img {
        width: 100%;
        height: 100px;
        object-fit: cover;
        display: block;
      }
      .itinerary-pdf-doc-label {
        margin: 0 0 6px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #0f766e;
      }
      .itinerary-pdf-dest-list { margin: 10px 0 8px; display: flex; flex-direction: column; gap: 8px; }
      .itinerary-pdf-dest-card {
        border: 1px solid #99f6e4;
        background: #f0fdfa;
        border-radius: 8px;
        padding: 8px 10px;
      }
      .itinerary-pdf-dest-card-inner { display: flex; gap: 10px; align-items: flex-start; }
      .itinerary-pdf-imgwrap--dest { width: 132px; height: 96px; flex-shrink: 0; border-radius: 8px; overflow: hidden; }
      .itinerary-pdf-dest-text { flex: 1; min-width: 0; }
      .itinerary-pdf-dest-name { margin: 0; font-size: 13px; font-weight: 800; color: #134e4a; }
      .itinerary-pdf-dest-route { margin: 2px 0 0; font-size: 10px; font-weight: 600; color: #0f766e; }
      .itinerary-pdf-dest-desc { margin: 4px 0 0; font-size: 10px; line-height: 1.45; color: #404040; white-space: pre-wrap; }
      .itinerary-pdf-day-hotel {
        margin: 8px 0;
        padding: 8px 10px;
        border-left: 3px solid #059669;
        background: #ecfdf5;
        border-radius: 0 6px 6px 0;
      }
      .itinerary-pdf-day-hotel-label { margin: 0; font-size: 9px; font-weight: 800; text-transform: uppercase; color: #047857; }
      .itinerary-pdf-day-hotel-name { margin: 4px 0 0; font-size: 12px; }
      .itinerary-pdf-day-hotel-meta { margin: 2px 0 0; font-size: 10px; color: #404040; }
      .itinerary-pdf-page-header {
        margin-bottom: 14px;
        padding-bottom: 10px;
        border-bottom: 2px solid #0f766e;
      }
      .itinerary-pdf-page-header-inner {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .itinerary-pdf-page-logo { object-fit: contain; flex-shrink: 0; }
      .itinerary-pdf-page-header-name { margin: 0; font-size: 12px; font-weight: 900; color: #0f766e; }
      .itinerary-pdf-page-header-contact { margin: 2px 0 0; font-size: 9px; font-weight: 600; color: #404040; }
      .pdf-page-section { padding-top: 8px; margin-top: 16px; }
      .pdf-keep-together {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        -webkit-column-break-inside: avoid !important;
      }
      .itinerary-pdf-package-title { font-size: 16px; font-weight: 800; color: #115e59; margin: 8px 0 0; }
      .itinerary-pdf-hotel-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
        margin-top: 8px;
      }
      .itinerary-pdf-hotel-table th,
      .itinerary-pdf-hotel-table td {
        border: 1px solid #525252;
        padding: 8px 10px;
        text-align: left;
      }
      .itinerary-pdf-hotel-table thead th {
        background: #f0fdfa;
        font-weight: 800;
        text-transform: uppercase;
        font-size: 9px;
      }
      .itinerary-pdf-policies-wrap {
        background: #fafafa;
        padding: 16px;
        border-radius: 10px;
        border: 1px solid #e5e5e5;
        margin-top: 16px;
      }
      .itinerary-pdf-policies-head { margin-bottom: 12px; }
      .itinerary-pdf-policy-unit {
        margin-bottom: 12px;
        padding: 12px 14px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      .itinerary-pdf-policy-heading-wrap { margin-bottom: 6px; }
      .itinerary-pdf-policy-intro { font-size: 11px; color: #404040; margin: 0 0 14px; line-height: 1.5; }
      .itinerary-pdf-policy-title { margin: 0 0 6px; font-size: 12px; font-weight: 900; color: #0f766e; text-transform: uppercase; letter-spacing: 0.06em; }
      .itinerary-pdf-policy-lead { margin: 0 0 6px; font-size: 11px; font-weight: 700; color: #262626; }
      .itinerary-pdf-policy-body { font-size: 10px; line-height: 1.55; color: #404040; }
      .itinerary-pdf-policy-bullet { margin: 0 0 4px; padding-left: 12px; position: relative; }
      .itinerary-pdf-policy-bullet::before { content: "•"; position: absolute; left: 0; color: #0f766e; font-weight: 700; }
      .itinerary-pdf-policy-p { margin: 0 0 6px; }
      .itinerary-pdf-day-hotel-inner { display: flex; gap: 12px; align-items: flex-start; }
      .itinerary-pdf-imgwrap--hotel { width: 140px; height: 100px; flex-shrink: 0; border-radius: 8px; overflow: hidden; }
      .itinerary-pdf-day-hotel-type { font-size: 10px; color: #525252; margin: 2px 0; text-transform: capitalize; }
      .itinerary-pdf-day-hotel-dates { font-size: 10px; font-weight: 700; color: #047857; margin: 4px 0 0; }
      .itinerary-pdf-policy-block {
        margin-top: 12px;
        padding: 10px 12px;
        border: 1px solid #d4d4d4;
        background: #fafafa;
      }
      .itinerary-pdf-policy-block h4 {
        margin: 0 0 6px;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        color: #0f766e;
      }
      .itinerary-pdf-policy-block p { margin: 0; font-size: 11px; line-height: 1.45; }
      .itinerary-pdf-bank-footer {
        margin-top: 32px;
        padding: 20px 0 24px;
        border-top: 3px solid #0f766e;
      }
      .itinerary-pdf-bank-title {
        font-size: 14px;
        font-weight: 900;
        text-transform: uppercase;
        color: #0f766e;
        margin: 12px 0;
      }
      .itinerary-pdf-bank-table {
        width: 100%;
        max-width: 480px;
        border-collapse: collapse;
        font-size: 12px;
      }
      .itinerary-pdf-bank-table th {
        text-align: left;
        padding: 6px 12px 6px 0;
        font-weight: 700;
        width: 38%;
      }
      .itinerary-pdf-bank-table td { padding: 6px 0; font-weight: 600; }
      .itinerary-pdf-footer-line { font-size: 11px; color: #404040; }
    `}</style>
  );
}
