'use client';

/** Shared PDF document layout (itinerary, invoice, voucher) — hero + cards + tables */
export function CrmPdfDocumentStyles() {
  return (
    <style>{`
      .crm-pdf-doc {
        max-width: 210mm;
        margin: 0 auto;
        padding: 20px 24px 32px;
        font-family: system-ui, "Segoe UI", sans-serif;
        color: #111;
        background: #fff;
      }
      .crm-pdf-doc * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .pdf-keep-together {
        break-inside: avoid;
        page-break-inside: avoid;
        -webkit-column-break-inside: avoid;
      }
      .crm-pdf-section-title {
        margin: 0 0 10px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #0f766e;
      }
      .crm-pdf-card {
        margin-bottom: 14px;
        padding: 14px 16px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        background: #fafafa;
      }
      .crm-pdf-kv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; }
      .crm-pdf-kv { display: flex; flex-direction: column; gap: 2px; }
      .crm-pdf-k { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #6b7280; }
      .crm-pdf-v { font-size: 13px; font-weight: 600; color: #111; }
      .crm-pdf-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 4px; }
      .crm-pdf-table th, .crm-pdf-table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
      .crm-pdf-table thead th { background: #ecfdf5; font-weight: 800; font-size: 9px; text-transform: uppercase; color: #065f46; }
      .crm-pdf-table tbody tr:nth-child(even) { background: #f9fafb; }
      .crm-pdf-pay-card {
        margin-bottom: 14px;
        padding: 16px;
        border-radius: 10px;
        border: 2px solid #0f766e;
        background: linear-gradient(135deg, #ecfdf5 0%, #fff 100%);
      }
      .crm-pdf-pay-line { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
      .crm-pdf-pay-balance { font-size: 14px; padding-top: 8px; border-top: 1px dashed #99f6e4; color: #065f46; font-weight: 700; }
      .crm-pdf-footer {
        margin-top: 20px;
        padding-top: 14px;
        border-top: 2px solid #111;
        font-size: 11px;
        line-height: 1.5;
        text-align: left;
      }
      .crm-pdf-footer p { margin: 0 0 4px; }
      .crm-pdf-blurb { font-size: 11px; line-height: 1.55; color: #404040; margin: 0 0 14px; }
    `}</style>
  );
}
