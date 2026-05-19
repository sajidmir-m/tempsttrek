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
  synced_to_ledger_at?: string | null;
};

/** Sync invoice revenue/payment to linked trip ledger whenever a ledger is selected. */
export async function syncInvoiceToLedger(invoice: InvoiceForSync): Promise<{ ok: boolean; message?: string }> {
  if (!invoice.ledger_id) {
    return { ok: false, message: 'No trip ledger linked' };
  }

  const actor = await crmActorFields();
  const vendor = `Invoice — ${invoice.customer_name} (${invoice.invoice_number})`;
  const paidAmount = invoice.status === 'paid' ? invoice.amount : 0;
  const notes = `Auto-synced from invoice ${invoice.invoice_number} · status: ${invoice.status}`;

  const itemPayload = {
    ledger_id: invoice.ledger_id,
    category: 'other' as const,
    vendor,
    total_cost: invoice.amount,
    paid_amount: paidAmount,
    entry_date: invoice.issue_date,
    notes,
    source_invoice_id: invoice.id,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from('crm_trip_ledger_items')
    .select('id')
    .eq('source_invoice_id', invoice.id)
    .maybeSingle();

  if (existing?.id) {
    const { error: itemError } = await supabase
      .from('crm_trip_ledger_items')
      .update(itemPayload)
      .eq('id', existing.id);
    if (itemError) return { ok: false, message: itemError.message };
  } else {
    const { error: itemError } = await supabase.from('crm_trip_ledger_items').insert({
      ...itemPayload,
      ...actor,
    });
    if (itemError) {
      if (itemError.code === '23505') {
        const { error: retry } = await supabase
          .from('crm_trip_ledger_items')
          .update(itemPayload)
          .eq('source_invoice_id', invoice.id);
        if (retry) return { ok: false, message: retry.message };
      } else {
        return { ok: false, message: itemError.message };
      }
    }
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

  const { data: cashExisting } = await supabase
    .from('crm_ledger_entries')
    .select('id')
    .eq('reference', invoice.id)
    .maybeSingle();

  if (invoice.status === 'paid') {
    const cashPayload = {
      entry_date: invoice.issue_date,
      description: `Invoice ${invoice.invoice_number} — ${invoice.customer_name}`,
      flow: 'in' as const,
      amount: invoice.amount,
      reference: invoice.id,
      updated_at: new Date().toISOString(),
    };
    if (cashExisting?.id) {
      const { error: cashError } = await supabase
        .from('crm_ledger_entries')
        .update(cashPayload)
        .eq('id', cashExisting.id);
      if (cashError && cashError.code !== '42P01') {
        console.warn('Cashbook update failed:', cashError.message);
      }
    } else {
      const { error: cashError } = await supabase.from('crm_ledger_entries').insert({
        ...cashPayload,
        ...actor,
      });
      if (cashError && cashError.code !== '42P01') {
        console.warn('Cashbook sync failed:', cashError.message);
      }
    }
  } else if (cashExisting?.id) {
    await supabase.from('crm_ledger_entries').delete().eq('id', cashExisting.id);
  }

  await markSynced(invoice.id);
  return { ok: true };
}

/** Remove ledger line when invoice is unlinked from a trip ledger. */
export async function unlinkInvoiceFromLedger(invoiceId: string): Promise<void> {
  await supabase.from('crm_trip_ledger_items').delete().eq('source_invoice_id', invoiceId);
  await supabase.from('crm_ledger_entries').delete().eq('reference', invoiceId);
  await supabase
    .from('crm_invoices')
    .update({ synced_to_ledger_at: null, updated_at: new Date().toISOString() })
    .eq('id', invoiceId);
}

/** @deprecated Use syncInvoiceToLedger */
export const syncPaidInvoiceToLedger = syncInvoiceToLedger;

async function markSynced(invoiceId: string) {
  await supabase
    .from('crm_invoices')
    .update({ synced_to_ledger_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', invoiceId);
}
