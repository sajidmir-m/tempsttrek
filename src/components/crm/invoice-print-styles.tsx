/** Invoice PDF screen + print styles (shares CSS variables with itinerary PDF). */
export function InvoicePrintStyles() {
  return (
    <style>{`
      .invoice-pdf-root {
        --pdf-ink: #0a0a0a;
        --pdf-body: #262626;
        --pdf-muted: #525252;
        --pdf-brand: #0f766e;
        --pdf-brand-dark: #115e59;
        --pdf-border: #171717;
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: var(--pdf-ink);
        background: #fff;
      }
      .invoice-pdf-root * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .pdf-avoid-break { page-break-inside: avoid; }
      .invoice-pdf-banner {
        background: linear-gradient(90deg, var(--pdf-brand-dark) 0%, var(--pdf-brand) 100%);
        color: #fff;
        padding: 12px 18px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      .invoice-pdf-title-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        margin-top: 18px;
      }
      .invoice-pdf-h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 900;
        letter-spacing: -0.02em;
      }
      .invoice-pdf-invno {
        margin: 0;
        font-size: 13px;
        font-weight: 800;
        font-family: ui-monospace, monospace;
        color: var(--pdf-brand-dark);
      }
      .invoice-pdf-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
        border: 2px solid var(--pdf-border);
        margin-top: 18px;
      }
      .invoice-pdf-cell {
        padding: 12px 16px;
        border: 1px solid #737373;
        min-height: 52px;
      }
      .invoice-pdf-label {
        font-size: 9px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--pdf-brand-dark);
        margin-bottom: 4px;
      }
      .invoice-pdf-value {
        font-size: 13px;
        font-weight: 700;
        color: var(--pdf-ink);
        line-height: 1.45;
      }
      .invoice-pdf-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 22px;
        border: 2px solid var(--pdf-border);
      }
      .invoice-pdf-table th {
        background: var(--pdf-brand);
        color: #fff;
        text-align: left;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 10px 14px;
      }
      .invoice-pdf-table td {
        padding: 14px 16px;
        font-size: 13px;
        border-bottom: 1px solid #a3a3a3;
        vertical-align: top;
      }
      .invoice-pdf-table tr:last-child td { border-bottom: none; }
      .invoice-pdf-amount {
        text-align: right;
        font-size: 18px;
        font-weight: 900;
        color: var(--pdf-brand-dark);
      }
      .invoice-pdf-status {
        display: inline-block;
        margin-top: 4px;
        padding: 4px 10px;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border: 2px solid var(--pdf-border);
        background: #fafafa;
      }
      .invoice-pdf-notes {
        margin-top: 22px;
        padding: 14px 16px;
        border: 2px solid var(--pdf-border);
        background: #fafafa;
      }
      .invoice-pdf-notes h3 {
        margin: 0 0 8px;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--pdf-brand-dark);
      }
      .invoice-pdf-notes p {
        margin: 0;
        font-size: 12.5px;
        line-height: 1.55;
        white-space: pre-wrap;
        color: var(--pdf-body);
      }
      .invoice-pdf-footer {
        margin-top: 28px;
        padding-top: 16px;
        border-top: 2px solid var(--pdf-border);
        font-size: 10.5px;
        font-weight: 600;
        color: var(--pdf-muted);
      }
      @media print {
        .invoice-pdf-root { font-size: 11pt; }
      }
      @media (max-width: 640px) {
        .invoice-pdf-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
