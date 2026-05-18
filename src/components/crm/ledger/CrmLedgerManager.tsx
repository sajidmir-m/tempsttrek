'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { crmActorFields } from '@/lib/crm-auth';
import { useToast } from '@/components/ui/Toast';
import {
  LEDGER_CATEGORIES,
  VENDOR_LABEL_BY_CATEGORY,
  computeNetProfit,
  computeRemaining,
  getPaymentBreakdown,
  formatCategoryLabel,
  formatInr,
  normalizeCategory,
  paymentStatusLabel,
  sumLedgerCosts,
  type LedgerCategory,
  type PaymentStatus,
} from '@/lib/ledger-utils';
import CrmPaymentPreview from './CrmPaymentPreview';
import { exportLedgerExcel, exportLedgerPdf, printLedger } from '@/lib/ledger-export';
import CrmInput from '../ui/CrmInput';
import CrmTextarea from '../ui/CrmTextarea';
import CrmSelect from '../ui/CrmSelect';
import CrmButton from '../ui/CrmButton';
import CrmDialog from '../ui/CrmDialog';
import CrmBadge, { paymentStatusTone } from '../ui/CrmBadge';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import CrmEntityDetailModal from '../details/CrmEntityDetailModal';
import CrmAnimatedCounter from './CrmAnimatedCounter';
import CrmLedgerAnalytics from './CrmLedgerAnalytics';
import { DEMO_LEDGER_ITEMS, type TripLedgerItemRow, type TripLedgerRow } from './ledger-types';
import {
  BookOpen,
  Download,
  Eye,
  FileSpreadsheet,
  Pencil,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const LOCAL_KEY = 'crm_trip_ledger_local_v2';

type LocalStore = {
  ledgers: TripLedgerRow[];
  items: TripLedgerItemRow[];
  activeId: string;
};

type ItemForm = {
  category: LedgerCategory;
  vendor: string;
  total_cost: string;
  paid_amount: string;
  entry_date: string;
  notes: string;
};

const emptyItemForm = (): ItemForm => ({
  category: 'hotel',
  vendor: '',
  total_cost: '',
  paid_amount: '',
  entry_date: new Date().toISOString().slice(0, 10),
  notes: '',
});

type ItemModal = { mode: 'create' } | { mode: 'edit'; row: TripLedgerItemRow } | null;

function enrichItem(row: TripLedgerItemRow) {
  const remaining = computeRemaining(row.total_cost, row.paid_amount);
  const { status } = getPaymentBreakdown(row.total_cost, row.paid_amount);
  return { ...row, category: normalizeCategory(row.category), remaining, status };
}

export default function CrmLedgerManager() {
  const [ledger, setLedger] = useState<TripLedgerRow | null>(null);
  const [allLedgers, setAllLedgers] = useState<TripLedgerRow[]>([]);
  const [localStore, setLocalStore] = useState<LocalStore | null>(null);
  const [items, setItems] = useState<TripLedgerItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [useLocal, setUseLocal] = useState(false);
  const [q, setQ] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | ''>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [itemModal, setItemModal] = useState<ItemModal>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<ReturnType<typeof enrichItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItemForm());
  const [sellingPrice, setSellingPrice] = useState('48000');
  const [ledgerTitle, setLedgerTitle] = useState('Kashmir Package Ledger');
  const { showToast } = useToast();

  const applyLocalStore = useCallback((store: LocalStore) => {
    setLocalStore(store);
    setAllLedgers(store.ledgers);
    const active = store.ledgers.find((l) => l.id === store.activeId) || store.ledgers[0];
    if (!active) return false;
    setLedger(active);
    setItems(store.items.filter((i) => i.ledger_id === active.id));
    setSellingPrice(String(active.package_selling_price));
    setLedgerTitle(active.title);
    return true;
  }, []);

  const loadLocal = useCallback(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as LocalStore;
      if (!parsed.ledgers?.length) return false;
      return applyLocalStore(parsed);
    } catch {
      return false;
    }
  }, [applyLocalStore]);

  const saveLocal = useCallback(
    (l: TripLedgerRow, list: TripLedgerItemRow[], ledgers?: TripLedgerRow[], allItems?: TripLedgerItemRow[]) => {
      const prev = localStore;
      const nextLedgers = ledgers ?? prev?.ledgers.map((x) => (x.id === l.id ? l : x)) ?? [l];
      const otherItems = (allItems ?? prev?.items ?? []).filter((i) => i.ledger_id !== l.id);
      const store: LocalStore = {
        ledgers: nextLedgers,
        items: [...otherItems, ...list],
        activeId: l.id,
      };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
      setLocalStore(store);
      setAllLedgers(nextLedgers);
    },
    [localStore]
  );

  const loadItemsForLedger = useCallback(async (ledgerId: string, useLocalMode: boolean) => {
    if (useLocalMode && localStore) {
      const active = localStore.ledgers.find((l) => l.id === ledgerId);
      if (active) {
        setLedger(active);
        setItems(localStore.items.filter((i) => i.ledger_id === ledgerId));
        setSellingPrice(String(active.package_selling_price));
        setLedgerTitle(active.title);
      }
      return;
    }
    const { data: lines, error } = await supabase
      .from('crm_trip_ledger_items')
      .select('id,ledger_id,category,vendor,total_cost,paid_amount,entry_date,notes,created_at')
      .eq('ledger_id', ledgerId)
      .order('entry_date', { ascending: false });
    if (error) throw error;
    setItems((lines || []) as TripLedgerItemRow[]);
  }, [localStore]);

  const switchLedger = async (ledgerId: string) => {
    const picked = allLedgers.find((l) => l.id === ledgerId);
    if (!picked) return;
    setLedger(picked);
    setSellingPrice(String(picked.package_selling_price));
    setLedgerTitle(picked.title);
    setLoading(true);
    try {
      if (useLocal && localStore) {
        const store = { ...localStore, activeId: ledgerId };
        localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
        setLocalStore(store);
        await loadItemsForLedger(ledgerId, true);
      } else {
        await loadItemsForLedger(ledgerId, false);
      }
    } finally {
      setLoading(false);
    }
  };

  const createNewTripLedger = async () => {
    const title = window.prompt('Trip / package name for this ledger?', `Trip ${new Date().toLocaleDateString('en-IN')}`);
    if (!title?.trim()) return;
    setLoading(true);
    try {
      if (useLocal) {
        const id = crypto.randomUUID();
        const row: TripLedgerRow = {
          id,
          title: title.trim(),
          customer_name: null,
          package_selling_price: 0,
          notes: null,
          updated_at: new Date().toISOString(),
        };
        const store: LocalStore = {
          ledgers: [row, ...allLedgers],
          items: localStore?.items ?? [],
          activeId: id,
        };
        localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
        applyLocalStore(store);
        setItems([]);
        showToast('New trip ledger created', 'success');
        return;
      }
      const actor = await crmActorFields();
      const { data, error } = await supabase
        .from('crm_trip_ledgers')
        .insert({ title: title.trim(), package_selling_price: 0, ...actor })
        .select('id,title,customer_name,package_selling_price,notes,updated_at')
        .single();
      if (error) throw error;
      showToast('New trip ledger created', 'success');
      await load();
      if (data) await switchLedger(data.id);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Could not create ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: ledgers, error: le } = await supabase
        .from('crm_trip_ledgers')
        .select('id,title,customer_name,package_selling_price,notes,updated_at')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (le) {
        if (le.code === '42P01' || le.message?.includes('does not exist')) {
          setUseLocal(true);
          if (!loadLocal()) await seedDemoLocal();
          return;
        }
        throw le;
      }

      const list = (ledgers || []) as TripLedgerRow[];
      setAllLedgers(list);

      let active = list[0] || null;
      if (!active) {
        const actor = await crmActorFields();
        const { data: created, error: ce } = await supabase
          .from('crm_trip_ledgers')
          .insert({
            title: 'Kashmir Package Ledger',
            package_selling_price: 48000,
            ...actor,
          })
          .select('id,title,customer_name,package_selling_price,notes,updated_at')
          .single();
        if (ce) throw ce;
        active = created as TripLedgerRow;
        setAllLedgers([active]);
        const actor2 = await crmActorFields();
        const seeds = DEMO_LEDGER_ITEMS.map((d) => ({ ...d, ledger_id: active!.id, ...actor2 }));
        await supabase.from('crm_trip_ledger_items').insert(seeds);
      }

      setLedger(active);
      setSellingPrice(String(active.package_selling_price));
      setLedgerTitle(active.title);
      await loadItemsForLedger(active.id, false);
      setUseLocal(false);
    } catch (e: unknown) {
      setUseLocal(true);
      if (!loadLocal()) {
        await seedDemoLocal();
      }
      if (!(e instanceof Error) || !e.message.includes('does not exist')) {
        showToast('Using offline ledger — run Supabase migration for cloud sync', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [loadLocal, loadItemsForLedger, showToast]);

  const seedDemoLocal = async () => {
    const id = crypto.randomUUID();
    const ledgerRow: TripLedgerRow = {
      id,
      title: 'Kashmir Package Ledger',
      customer_name: null,
      package_selling_price: 48000,
      notes: null,
      updated_at: new Date().toISOString(),
    };
    const demoItems: TripLedgerItemRow[] = DEMO_LEDGER_ITEMS.map((d) => ({
      ...d,
      id: crypto.randomUUID(),
      ledger_id: id,
    }));
    const store: LocalStore = { ledgers: [ledgerRow], items: demoItems, activeId: id };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
    applyLocalStore(store);
  };

  useEffect(() => {
    void load();
  }, [load]);

  const enriched = useMemo(() => items.map(enrichItem), [items]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return enriched.filter((r) => {
      if (filterCategory && r.category !== filterCategory) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterDateFrom && r.entry_date < filterDateFrom) return false;
      if (filterDateTo && r.entry_date > filterDateTo) return false;
      if (!s) return true;
      return (
        r.vendor.toLowerCase().includes(s) ||
        formatCategoryLabel(r.category).toLowerCase().includes(s) ||
        paymentStatusLabel(r.status).toLowerCase().includes(s)
      );
    });
  }, [enriched, q, filterCategory, filterStatus, filterDateFrom, filterDateTo]);

  const totalCost = useMemo(() => sumLedgerCosts(filtered), [filtered]);
  const selling = Number.parseFloat(sellingPrice) || 0;
  const netProfit = computeNetProfit(selling, totalCost);

  const exportMeta = useMemo(
    () => ({
      title: ledgerTitle,
      customerName: ledger?.customer_name,
      packageSellingPrice: selling,
      generatedAt: new Date().toLocaleString('en-IN'),
    }),
    [ledger?.customer_name, ledgerTitle, selling]
  );

  const persistSellingPrice = async () => {
    const price = Number.parseFloat(sellingPrice);
    if (!ledger || !Number.isFinite(price) || price < 0) return;
    if (useLocal) {
      const next = { ...ledger, package_selling_price: price, title: ledgerTitle, updated_at: new Date().toISOString() };
      setLedger(next);
      saveLocal(next, items);
      return;
    }
    await supabase
      .from('crm_trip_ledgers')
      .update({ package_selling_price: price, title: ledgerTitle, updated_at: new Date().toISOString() })
      .eq('id', ledger.id);
    setLedger((l) => (l ? { ...l, package_selling_price: price, title: ledgerTitle } : l));
  };

  const openCreate = () => {
    setItemForm(emptyItemForm());
    setItemModal({ mode: 'create' });
  };

  const openEdit = (row: TripLedgerItemRow) => {
    setItemForm({
      category: normalizeCategory(row.category),
      vendor: row.vendor,
      total_cost: String(row.total_cost),
      paid_amount: String(row.paid_amount),
      entry_date: row.entry_date,
      notes: row.notes || '',
    });
    setItemModal({ mode: 'edit', row });
  };

  const saveItem = async () => {
    const vendor = itemForm.vendor.trim();
    if (!vendor) {
      showToast('Vendor / hotel name is required', 'error');
      return;
    }
    const total_cost = Number.parseFloat(itemForm.total_cost);
    const paid_amount = Number.parseFloat(itemForm.paid_amount || '0');
    if (!Number.isFinite(total_cost) || total_cost < 0) {
      showToast('Enter a valid total cost', 'error');
      return;
    }
    if (!Number.isFinite(paid_amount) || paid_amount < 0) {
      showToast('Enter a valid paid amount', 'error');
      return;
    }
    if (!ledger) return;

    const payload = {
      category: itemForm.category,
      vendor,
      total_cost,
      paid_amount,
      entry_date: itemForm.entry_date,
      notes: itemForm.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    try {
      if (useLocal) {
        let nextItems: TripLedgerItemRow[];
        if (itemModal?.mode === 'edit') {
          nextItems = items.map((r) => (r.id === itemModal.row.id ? { ...r, ...payload } : r));
        } else {
          nextItems = [
            { id: crypto.randomUUID(), ledger_id: ledger.id, ...payload },
            ...items,
          ];
        }
        setItems(nextItems);
        const nextLedger = { ...ledger, updated_at: new Date().toISOString() };
        setLedger(nextLedger);
        saveLocal(nextLedger, nextItems);
      } else {
        if (itemModal?.mode === 'edit') {
          const { error } = await supabase.from('crm_trip_ledger_items').update(payload).eq('id', itemModal.row.id);
          if (error) throw error;
        } else {
          const actor = await crmActorFields();
          const { error } = await supabase
            .from('crm_trip_ledger_items')
            .insert({ ...payload, ledger_id: ledger.id, ...actor });
          if (error) throw error;
        }
        await load();
      }
      showToast(itemModal?.mode === 'edit' ? 'Entry updated' : 'Entry added', 'success');
      setItemModal(null);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: TripLedgerItemRow) => {
    if (!window.confirm(`Delete “${row.vendor}”?`)) return;
    try {
      if (useLocal) {
        const nextItems = items.filter((r) => r.id !== row.id);
        setItems(nextItems);
        if (ledger) saveLocal(ledger, nextItems);
      } else {
        const { error } = await supabase.from('crm_trip_ledger_items').delete().eq('id', row.id);
        if (error) throw error;
        await load();
      }
      showToast('Deleted', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  const vendorLabel = VENDOR_LABEL_BY_CATEGORY[itemForm.category] || 'Vendor name';

  return (
    <div className="space-y-5 pb-32">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">Expense & profit ledger</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Package Ledger</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Track hotels, cabs, offices & other costs — Unpaid, Partial, or Paid as you enter amounts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CrmButton
              variant="secondary"
              size="md"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              onClick={() => void exportLedgerPdf(exportMeta, filtered)}
            >
              <Download size={16} /> PDF
            </CrmButton>
            <CrmButton
              variant="secondary"
              size="md"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              onClick={() => exportLedgerExcel(exportMeta, filtered)}
            >
              <FileSpreadsheet size={16} /> Excel
            </CrmButton>
            <CrmButton
              variant="secondary"
              size="md"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              onClick={() => printLedger(exportMeta, filtered)}
            >
              <Printer size={16} /> Print
            </CrmButton>
            <CrmButton variant="primary" size="md" onClick={openCreate}>
              <Plus size={18} /> Add entry
            </CrmButton>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Selling price', value: selling, accent: 'text-teal-700' },
          { label: 'Total cost', value: totalCost, accent: 'text-amber-700' },
          { label: 'Net profit', value: netProfit, accent: netProfit >= 0 ? 'text-emerald-700' : 'text-red-700' },
          { label: 'Line items', value: filtered.length, accent: 'text-slate-800', currency: false },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className={cn('mt-2 text-2xl font-extrabold', card.accent)}>
              {'currency' in card && card.currency === false ? (
                <CrmAnimatedCounter value={card.value} prefix="" />
              ) : (
                <CrmAnimatedCounter value={card.value} prefix="₹" />
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 backdrop-blur-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <CrmSelect
              label="Trip / package ledger"
              value={ledger?.id || ''}
              onChange={(e) => void switchLedger(e.target.value)}
            >
              {allLedgers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                  {l.customer_name ? ` — ${l.customer_name}` : ''}
                </option>
              ))}
            </CrmSelect>
          </div>
          <CrmButton variant="secondary" size="md" onClick={() => void createNewTripLedger()}>
            <Plus size={16} /> New trip ledger
          </CrmButton>
        </div>
        <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <CrmInput label="Ledger title" value={ledgerTitle} onChange={(e) => setLedgerTitle(e.target.value)} onBlur={() => void persistSellingPrice()} />
          <CrmInput
            label="Package selling price (₹)"
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            onBlur={() => void persistSellingPrice()}
          />
          <CrmInput placeholder="Search vendor…" value={q} onChange={(e) => setQ(e.target.value)} />
          <CrmSelect label="Category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All categories</option>
            {LEDGER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {formatCategoryLabel(c)}
              </option>
            ))}
          </CrmSelect>
          <CrmSelect label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | '')}>
            <option value="">All statuses</option>
            <option value="paid">Paid (fully settled)</option>
            <option value="partial">Partial (some paid)</option>
            <option value="pending">Unpaid (nothing paid)</option>
          </CrmSelect>
          <div className="grid grid-cols-2 gap-2">
            <CrmInput label="From" type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
            <CrmInput label="To" type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
          </div>
        </div>
        {useLocal ? (
          <p className="mb-3 flex items-center gap-2 text-xs text-amber-700">
            <Sparkles size={14} /> Offline mode — apply migration <code className="rounded bg-amber-100 px-1">20260522_trip_expense_ledger.sql</code> for Supabase sync.
          </p>
        ) : null}
      </div>

      <CrmLedgerAnalytics items={items} />

      {loading ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <CrmSkeleton className="h-10 w-full" />
          <CrmSkeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={BookOpen} title="No ledger entries" description="Add expenses or load sample data from migration." />
      ) : (
        <>
          <div className="hidden md:block">
            <CrmTable>
              <CrmThead>
                <CrmTr>
                  <CrmTh>Category</CrmTh>
                  <CrmTh>Vendor</CrmTh>
                  <CrmTh>Total Cost</CrmTh>
                  <CrmTh>Paid</CrmTh>
                  <CrmTh>Remaining</CrmTh>
                  <CrmTh>Status</CrmTh>
                  <CrmTh>Date</CrmTh>
                  <CrmTh className="text-right">Actions</CrmTh>
                </CrmTr>
              </CrmThead>
              <CrmTbody>
                {filtered.map((r) => (
                  <CrmTr key={r.id}>
                    <CrmTd>
                      <CrmBadge tone="info">{formatCategoryLabel(r.category)}</CrmBadge>
                    </CrmTd>
                    <CrmTd className="font-medium text-slate-900">{r.vendor}</CrmTd>
                    <CrmTd>{formatInr(r.total_cost)}</CrmTd>
                    <CrmTd>{formatInr(r.paid_amount)}</CrmTd>
                    <CrmTd className="font-semibold">{formatInr(r.remaining)}</CrmTd>
                    <CrmTd>
                      <CrmBadge tone={paymentStatusTone(r.status)}>{paymentStatusLabel(r.status)}</CrmBadge>
                    </CrmTd>
                    <CrmTd className="text-xs text-slate-500">{r.entry_date}</CrmTd>
                    <CrmTd className="text-right">
                      <CrmButton variant="ghost" size="sm" onClick={() => setDetailRow(r)} title="View details">
                        <Eye size={16} />
                      </CrmButton>
                      <CrmButton variant="ghost" size="sm" onClick={() => openEdit(r)}>
                        <Pencil size={16} />
                      </CrmButton>
                      <CrmButton variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => remove(r)}>
                        <Trash2 size={16} />
                      </CrmButton>
                    </CrmTd>
                  </CrmTr>
                ))}
              </CrmTbody>
            </CrmTable>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CrmBadge tone="info">{formatCategoryLabel(r.category)}</CrmBadge>
                    <h3 className="mt-2 font-bold text-slate-900">{r.vendor}</h3>
                    <p className="text-xs text-slate-500">{r.entry_date}</p>
                  </div>
                  <CrmBadge tone={paymentStatusTone(r.status)}>{paymentStatusLabel(r.status)}</CrmBadge>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <dt className="text-[10px] uppercase text-slate-500">Total</dt>
                    <dd className="font-bold">{formatInr(r.total_cost)}</dd>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2">
                    <dt className="text-[10px] uppercase text-emerald-700">Paid</dt>
                    <dd className="font-bold text-emerald-800">{formatInr(r.paid_amount)}</dd>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-2">
                    <dt className="text-[10px] uppercase text-amber-800">Due</dt>
                    <dd className="font-bold text-amber-900">{formatInr(r.remaining)}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex justify-end gap-1">
                  <CrmButton variant="ghost" size="sm" onClick={() => setDetailRow(r)}>
                    <Eye size={16} /> Details
                  </CrmButton>
                  <CrmButton variant="ghost" size="sm" onClick={() => openEdit(r)}>
                    <Pencil size={16} />
                  </CrmButton>
                  <CrmButton variant="ghost" size="sm" className="text-red-600" onClick={() => remove(r)}>
                    <Trash2 size={16} />
                  </CrmButton>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="sticky bottom-4 z-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-teal-300/50 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-5 text-white shadow-2xl shadow-teal-900/30 backdrop-blur-md">
          <div className="flex items-center gap-2 text-teal-100">
            <TrendingUp size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Financial summary</span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-teal-100">Package selling price</p>
              <p className="text-xl font-extrabold">
                <CrmAnimatedCounter value={selling} prefix="₹" />
              </p>
            </div>
            <div>
              <p className="text-xs text-teal-100">Total company cost</p>
              <p className="text-xl font-extrabold">
                <CrmAnimatedCounter value={totalCost} prefix="₹" />
              </p>
            </div>
            <div>
              <p className="text-xs text-teal-100">Net profit</p>
              <p className="text-xl font-extrabold">
                <CrmAnimatedCounter value={netProfit} prefix="₹" />
              </p>
            </div>
          </div>
        </div>
      </div>

      <CrmDialog
        open={itemModal != null}
        title={itemModal?.mode === 'edit' ? 'Edit ledger entry' : 'Add ledger entry'}
        onClose={() => !saving && setItemModal(null)}
      >
        <div className="space-y-3">
          <CrmSelect label="Category" value={itemForm.category} onChange={(e) => setItemForm((f) => ({ ...f, category: e.target.value as LedgerCategory }))}>
            {LEDGER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {formatCategoryLabel(c)}
              </option>
            ))}
          </CrmSelect>
          <CrmInput label={vendorLabel} value={itemForm.vendor} onChange={(e) => setItemForm((f) => ({ ...f, vendor: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Total cost (₹)" type="number" min="0" step="0.01" value={itemForm.total_cost} onChange={(e) => setItemForm((f) => ({ ...f, total_cost: e.target.value }))} />
            <CrmInput label="Paid so far (₹)" type="number" min="0" step="0.01" value={itemForm.paid_amount} onChange={(e) => setItemForm((f) => ({ ...f, paid_amount: e.target.value }))} placeholder="0 if unpaid" />
          </div>
          <CrmInput label="Date" type="date" value={itemForm.entry_date} onChange={(e) => setItemForm((f) => ({ ...f, entry_date: e.target.value }))} />
          <CrmTextarea label="Notes" value={itemForm.notes} onChange={(e) => setItemForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Live preview</p>
            <CrmPaymentPreview totalCost={itemForm.total_cost} paidAmount={itemForm.paid_amount} />
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <CrmButton variant="secondary" size="md" onClick={() => setPreviewOpen(true)} disabled={!itemForm.vendor.trim()}>
              <Eye size={16} /> Full preview
            </CrmButton>
            <CrmButton variant="secondary" size="md" onClick={() => setItemModal(null)} disabled={saving}>
              Cancel
            </CrmButton>
            <CrmButton variant="primary" size="md" onClick={() => void saveItem()} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </CrmButton>
          </div>
        </div>
      </CrmDialog>

      <CrmDialog open={previewOpen} title="Ledger entry preview" onClose={() => setPreviewOpen(false)}>
        <div className="space-y-3 text-sm">
          <p>
            <span className="text-slate-500">Category:</span> {formatCategoryLabel(itemForm.category)}
          </p>
          <p>
            <span className="text-slate-500">Vendor:</span> {itemForm.vendor || '—'}
          </p>
          <CrmPaymentPreview totalCost={itemForm.total_cost} paidAmount={itemForm.paid_amount} />
        </div>
      </CrmDialog>

      <CrmEntityDetailModal
        open={detailRow != null}
        title={detailRow?.vendor || 'Expense details'}
        subtitle={detailRow ? formatCategoryLabel(detailRow.category) : undefined}
        onClose={() => setDetailRow(null)}
        sections={[
          {
            heading: 'Expense',
            fields: detailRow
              ? [
                  { label: 'Category', value: formatCategoryLabel(detailRow.category) },
                  { label: 'Total cost', value: formatInr(detailRow.total_cost) },
                  { label: 'Paid', value: formatInr(detailRow.paid_amount) },
                  { label: 'Remaining', value: formatInr(detailRow.remaining) },
                  {
                    label: 'Status',
                    value: (() => {
                      const b = getPaymentBreakdown(detailRow.total_cost, detailRow.paid_amount);
                      return `${paymentStatusLabel(detailRow.status)} — ${b.summary}`;
                    })(),
                  },
                  { label: 'Date', value: detailRow.entry_date },
                ]
              : [],
          },
          {
            heading: 'Payment history',
            fields: detailRow
              ? [
                  { label: 'Paid to date', value: formatInr(detailRow.paid_amount) },
                  { label: 'Balance due', value: formatInr(detailRow.remaining) },
                  { label: 'Notes', value: detailRow.notes || '—' },
                ]
              : [],
          },
        ]}
      />
    </div>
  );
}
