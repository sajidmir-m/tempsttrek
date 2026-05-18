/** Hotel voucher PDF styles — literal colors (html2canvas does not resolve CSS variables). */
export function InvoicePrintStyles() {
  return (
    <style>{`
      .invoice-pdf-root {
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #0f172a;
        background: #fff;
      }
      .invoice-pdf-root * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box;
      }
      .pdf-avoid-break { page-break-inside: avoid; }

      .hv-doc {
        max-width: 210mm;
        margin: 0 auto;
        background: #fff;
        color: #0f172a;
      }

      .hv-header {
        position: relative;
        min-height: 200px;
        overflow: hidden;
        border-radius: 0;
      }
      .hv-header-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 40%;
        z-index: 0;
      }
      .hv-header-overlay {
        position: absolute;
        inset: 0;
        z-index: 1;
        background: linear-gradient(
          180deg,
          rgba(8, 28, 48, 0.55) 0%,
          rgba(8, 28, 48, 0.72) 55%,
          rgba(8, 28, 48, 0.85) 100%
        );
      }
      .hv-header-inner {
        position: relative;
        z-index: 2;
        padding: 16px 20px 20px;
        color: #ffffff;
      }
      .hv-header-top {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
      }
      .hv-brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .hv-logo {
        width: 64px;
        height: 64px;
        object-fit: contain;
        background: rgba(255, 255, 255, 0.92);
        border-radius: 8px;
        padding: 4px;
      }
      .hv-brand-name {
        margin: 0;
        font-size: 18px;
        font-weight: 900;
        letter-spacing: 0.04em;
        color: #ffffff;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
      }
      .hv-brand-tag {
        margin: 2px 0 0;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.14em;
        color: #93c5fd;
        text-transform: uppercase;
      }
      .hv-contact {
        text-align: right;
        font-size: 10px;
        font-weight: 600;
        line-height: 1.55;
        max-width: 280px;
        color: #ffffff;
      }
      .hv-contact p { margin: 0 0 3px; color: #ffffff; }

      .hv-title-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-top: 18px;
      }
      .hv-title-line {
        flex: 1;
        max-width: 72px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #f0c14a, transparent);
      }
      .hv-title {
        margin: 0;
        font-size: 28px;
        font-weight: 900;
        letter-spacing: 0.12em;
        color: #f0c14a;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        white-space: nowrap;
      }
      .hv-quote {
        margin: 10px auto 0;
        max-width: 520px;
        text-align: center;
        font-size: 11px;
        font-style: italic;
        font-weight: 500;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.92);
      }

      .hv-info-bar {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0;
        border-bottom: 2px solid #b8c5d4;
        background: #ffffff;
      }
      .hv-info-item {
        padding: 12px 14px;
        text-align: center;
        border-right: 1px solid #b8c5d4;
        background: #ffffff;
      }
      .hv-info-item:last-child { border-right: none; }
      .hv-info-label {
        display: block;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #475569;
        margin-bottom: 4px;
      }
      .hv-info-value {
        font-size: 13px;
        font-weight: 800;
        color: #0f172a;
      }
      .hv-status-confirmed { color: #15803d !important; }

      .hv-panels {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        padding: 16px 14px;
        background: #ffffff;
      }
      .hv-panel {
        border: 1.5px solid #b8c5d4;
        border-radius: 10px;
        overflow: hidden;
        background: #ffffff;
      }
      .hv-panel-head {
        margin: 0;
        padding: 10px 14px;
        background: #0c2d4a;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .hv-panel-body { padding: 12px 14px; background: #ffffff; }
      .hv-field {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px dashed #e2e8f0;
        font-size: 11px;
      }
      .hv-field:last-child { border-bottom: none; }
      .hv-field-label {
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        font-size: 9px;
        letter-spacing: 0.06em;
      }
      .hv-field-value {
        font-weight: 800;
        text-align: right;
        color: #0f172a;
      }

      .hv-table-wrap {
        padding: 0 14px 16px;
        background: #ffffff;
      }
      .hv-table {
        width: 100%;
        border-collapse: collapse;
        border: 1.5px solid #0c2d4a;
        font-size: 10px;
        background: #ffffff;
      }
      .hv-table th {
        background: #0c2d4a;
        color: #ffffff;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 10px 8px;
        text-align: left;
        font-size: 9px;
      }
      .hv-table td {
        padding: 10px 8px;
        border-bottom: 1px solid #b8c5d4;
        font-weight: 700;
        vertical-align: top;
        color: #0f172a;
        background: #ffffff;
      }
      .hv-table tbody tr:nth-child(even) td {
        background: #f1f5f9;
        color: #0f172a;
      }
      .hv-table-empty {
        text-align: center;
        color: #475569;
        font-weight: 600;
        padding: 20px !important;
        font-size: 11px;
      }
      .hv-table-note {
        display: block;
        margin-top: 8px;
        font-size: 10px;
        white-space: pre-wrap;
        color: #0f172a;
      }
      .hv-table-empty code { color: #475569; }

      .hv-cab {
        margin: 0 14px 16px;
        border: 1.5px solid #b8c5d4;
        border-radius: 10px;
        overflow: hidden;
        background: #ffffff;
      }
      .hv-cab-head {
        margin: 0;
        padding: 10px 14px;
        background: #0c2d4a;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .hv-cab-body {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        background: #f8fafc;
        color: #0f172a;
      }
      .hv-cab-cols {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
      }
      .hv-cab-cols .hv-field {
        flex-direction: column;
        align-items: flex-start;
        border: none;
        padding: 0;
      }
      .hv-cab-cols .hv-field-label { color: #475569; }
      .hv-cab-cols .hv-field-value { text-align: left; color: #0f172a; }
      .hv-cab-art {
        width: 120px;
        height: 48px;
        flex-shrink: 0;
        opacity: 0.7;
      }

      .hv-terms {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        padding: 0 14px 20px;
        background: #ffffff;
      }
      .hv-term-box {
        border: 1.5px solid #b8c5d4;
        border-radius: 10px;
        overflow: hidden;
        background: #ffffff;
      }
      .hv-term-box--rel { position: relative; }
      .hv-term-head {
        margin: 0;
        padding: 10px 14px;
        background: #0c2d4a;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .hv-term-box ul {
        margin: 0;
        padding: 12px 14px 12px 28px;
        font-size: 10px;
        line-height: 1.55;
        font-weight: 600;
        color: #334155;
        background: #ffffff;
      }
      .hv-term-box li { color: #334155; }
      .hv-stamp {
        position: absolute;
        right: 12px;
        bottom: 12px;
        padding: 8px 16px;
        border: 3px solid #dc2626;
        color: #dc2626;
        font-size: 14px;
        font-weight: 900;
        letter-spacing: 0.12em;
        transform: rotate(-12deg);
        opacity: 0.85;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
      }

      .hv-footer {
        padding: 12px 14px 20px;
        border-top: 2px solid #b8c5d4;
        font-size: 10px;
        font-weight: 600;
        color: #475569;
        text-align: center;
        background: #ffffff;
      }
      .hv-footer p { margin: 0 0 4px; color: #475569; }

      @media print {
        .invoice-pdf-root { font-size: 10pt; }
        .hv-header { min-height: 180px; }
      }
      @media (max-width: 640px) {
        .hv-panels,
        .hv-terms,
        .hv-cab-cols { grid-template-columns: 1fr; }
        .hv-info-bar { grid-template-columns: 1fr; }
        .hv-info-item { border-right: none; border-bottom: 1px solid #b8c5d4; }
        .hv-title { font-size: 20px; }
        .hv-contact { text-align: left; }
      }
    `}</style>
  );
}
