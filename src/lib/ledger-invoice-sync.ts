import { supabase } from '@/lib/supabase';
import { crmActorFields } from '@/lib/crm-auth';

export type InvoiceForSync = {
  id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  status: string;
  issue_date: string;
  ledger_id: string | null;
  synced_to_ledger_at: string | null;
};

/** When an invoice is marked paid, record client payment on the linked trip ledger + cashbook. */
export async function syncPaidInvoiceToLedger(invoice: InvoiceForSync): Promise<{ ok: boolean; message?: string }> {
  if (invoice.status !== 'paid') {
    return { ok: false, message: 'Invoice is not paid' };
  }
  if (!invoice.ledger_id) {
    return { ok: false, message: 'No trip ledger linked' };
  }
  if (invoice.synced_to_ledger_at) {
    return { ok: true, message: 'Already synced' };
  }

  const actor = await crmActorFields();
  const vendor = `Client payment — ${invoice.customer_name} (${invoice.invoice_number})`;

  const { error: itemError } = await supabase.from('crm_trip_ledger_items').insert({
    ledger_id: invoice.ledger_id,
    category: 'other',
    vendor,
    total_cost: invoice.amount,
    paid_amount: invoice.amount,
    entry_date: invoice.issue_date,
    notes: `Auto-synced from paid invoice ${invoice.invoice_number}`,
    source_invoice_id: invoice.id,
    ...actor,
  });

  if (itemError) {
    if (itemError.code === '23505') {
      await markSynced(invoice.id);
      return { ok: true, message: 'Payment line already exists' };
    }
    return { ok: false, message: itemError.message };
  }

  const { error: cashError } = await supabase.from('crm_ledger_entries').insert({
    entry_date: invoice.issue_date,
    description: `Invoice ${invoice.invoice_number} — ${invoice.customer_name}`,
    flow: 'in',
    amount: invoice.amount,
    reference: invoice.id,
    ...actor,
  });

  if (cashError && cashError.code !== '42P01') {
    console.warn('Cashbook sync failed:', cashError.message);
  }

  const { data: ledger } = await supabase
    .from('crm_trip_ledgers')
    .select('package_selling_price')
    .eq('id', invoice.ledger_id)
    .single();

  if (ledger && Number(ledger.package_selling_price) < invoice.amount) {
    await supabase
      .from('crm_trip_ledgers')
      .update({
        package_selling_price: invoice.amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice.ledger_id);
  }

  await markSynced(invoice.id);
  return { ok: true };
}

async function markSynced(invoiceId: string) {
  await supabase
    .from('crm_invoices')
    .update({ synced_to_ledger_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', invoiceId);
}
