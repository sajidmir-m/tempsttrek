import {
  computeRemaining,
  computePaymentStatus,
  formatCategoryLabel,
  formatInr,
  paymentStatusLabel,
  sumLedgerCosts,
} from '@/lib/ledger-utils';

export type LedgerExportRow = {
  category: string;
  vendor: string;
  total_cost: number;
  paid_amount: number;
  entry_date: string;
};

export type LedgerExportMeta = {
  title: string;
  customerName?: string | null;
  packageSellingPrice: number;
  generatedAt?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildRowsHtml(rows: LedgerExportRow[]): string {
  return rows
    .map((r) => {
      const remaining = computeRemaining(r.total_cost, r.paid_amount);
      const status = paymentStatusLabel(computePaymentStatus(r.total_cost, r.paid_amount));
      return `<tr>
        <td>${formatCategoryLabel(r.category)}</td>
        <td>${escapeHtml(r.vendor)}</td>
        <td>${formatInr(r.total_cost)}</td>
        <td>${formatInr(r.paid_amount)}</td>
        <td>${formatInr(remaining)}</td>
        <td>${status}</td>
        <td>${r.entry_date}</td>
      </tr>`;
    })
    .join('');
}

export function buildLedgerPrintHtml(meta: LedgerExportMeta, rows: LedgerExportRow[]): string {
  const totalCost = sumLedgerCosts(rows);
  const netProfit = meta.packageSellingPrice - totalCost;
  const generatedAt = meta.generatedAt || new Date().toLocaleString('en-IN');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(meta.title)} — Ledger</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #0f172a; padding: 24px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
    th { background: #f8fafc; text-transform: uppercase; font-size: 11px; letter-spacing: 0.04em; }
    .summary { margin-top: 24px; padding: 16px; background: linear-gradient(135deg, #0f766e, #0d9488); color: white; border-radius: 12px; }
    .summary p { margin: 6px 0; font-size: 15px; }
    .summary strong { font-size: 18px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(meta.title)}</h1>
  <p class="meta">${meta.customerName ? `Customer: ${escapeHtml(meta.customerName)} · ` : ''}Generated ${generatedAt}</p>
  <table>
    <thead>
      <tr>
        <th>Category</th><th>Vendor / Hotel</th><th>Total Cost</th><th>Paid</th><th>Remaining</th><th>Status</th><th>Date</th>
      </tr>
    </thead>
    <tbody>${buildRowsHtml(rows)}</tbody>
  </table>
  <div class="summary">
    <p>Package Selling Price: <strong>${formatInr(meta.packageSellingPrice)}</strong></p>
    <p>Total Company Cost: <strong>${formatInr(totalCost)}</strong></p>
    <p>Net Profit: <strong>${formatInr(netProfit)}</strong></p>
  </div>
</body>
</html>`;
}

export function printLedger(meta: LedgerExportMeta, rows: LedgerExportRow[]): void {
  const doc = buildLedgerPrintHtml(meta, rows);
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) return;
  w.document.write(doc);
  w.document.close();
  w.onload = () => w.print();
}

export async function exportLedgerPdf(meta: LedgerExportMeta, rows: LedgerExportRow[]): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape' });
  const totalCost = sumLedgerCosts(rows);
  const netProfit = meta.packageSellingPrice - totalCost;

  doc.setFontSize(16);
  doc.text(meta.title, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(100);
  let subY = 22;
  if (meta.customerName) {
    doc.text(`Customer: ${meta.customerName}`, 14, subY);
    subY += 5;
  }
  doc.text(`Generated: ${meta.generatedAt || new Date().toLocaleString('en-IN')}`, 14, subY);

  let y = subY + 8;
  doc.setTextColor(0);
  doc.setFontSize(9);
  doc.text('Category', 14, y);
  doc.text('Vendor', 40, y);
  doc.text('Total', 110, y);
  doc.text('Paid', 135, y);
  doc.text('Remaining', 160, y);
  doc.text('Status', 195, y);
  doc.text('Date', 230, y);
  y += 6;

  for (const r of rows) {
    if (y > 190) {
      doc.addPage();
      y = 20;
    }
    const remaining = computeRemaining(r.total_cost, r.paid_amount);
    const status = paymentStatusLabel(computePaymentStatus(r.total_cost, r.paid_amount));
    doc.text(formatCategoryLabel(r.category), 14, y);
    doc.text(r.vendor.slice(0, 32), 40, y);
    doc.text(String(r.total_cost), 110, y);
    doc.text(String(r.paid_amount), 135, y);
    doc.text(String(remaining), 160, y);
    doc.text(status, 195, y);
    doc.text(r.entry_date, 230, y);
    y += 6;
  }

  y += 8;
  doc.setFontSize(11);
  doc.text(`Package Selling Price: ${formatInr(meta.packageSellingPrice)}`, 14, y);
  y += 7;
  doc.text(`Total Company Cost: ${formatInr(totalCost)}`, 14, y);
  y += 7;
  doc.text(`Net Profit: ${formatInr(netProfit)}`, 14, y);

  doc.save(`${meta.title.replace(/\s+/g, '-').toLowerCase()}-ledger.pdf`);
}

export function exportLedgerExcel(meta: LedgerExportMeta, rows: LedgerExportRow[]): void {
  const totalCost = sumLedgerCosts(rows);
  const netProfit = meta.packageSellingPrice - totalCost;
  const header = ['Category', 'Vendor/Hotel', 'Total Cost', 'Paid', 'Remaining', 'Status', 'Date'];
  const lines = [
    header.join(','),
    ...rows.map((r) => {
      const remaining = computeRemaining(r.total_cost, r.paid_amount);
      const status = paymentStatusLabel(computePaymentStatus(r.total_cost, r.paid_amount));
      return [
        formatCategoryLabel(r.category),
        `"${r.vendor.replace(/"/g, '""')}"`,
        r.total_cost,
        r.paid_amount,
        remaining,
        status,
        r.entry_date,
      ].join(',');
    }),
    '',
    `"Package Selling Price",${meta.packageSellingPrice}`,
    `"Total Company Cost",${totalCost}`,
    `"Net Profit",${netProfit}`,
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${meta.title.replace(/\s+/g, '-').toLowerCase()}-ledger.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
