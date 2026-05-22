'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { crmActorFields } from '@/lib/crm-auth';
import { useToast } from '@/components/ui/Toast';
import CrmInput from '../ui/CrmInput';
import CrmTextarea from '../ui/CrmTextarea';
import CrmSelect from '../ui/CrmSelect';
import CrmButton from '../ui/CrmButton';
import CrmDialog from '../ui/CrmDialog';
import CrmBadge from '../ui/CrmBadge';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import { FileDown, Mail, MessageCircle, Pencil, Plus, Printer, Ticket } from 'lucide-react';
import type { BookingVoucherPayload, BookingVoucherStay } from '@/lib/crm-catalog';
import { normalizeItinerarySections } from '@/lib/itinerary-utils';
import { todayYmd } from '@/lib/crm-date-rules';
import {
  payloadFromVoucherRow,
  rowPatchFromPayload,
  syncItineraryBookingVoucherJson,
  type BookingVoucherRecord,
} from '@/lib/booking-voucher-sync';
import { SITE_CONTACT } from '@/lib/site-contact';

const emptyStay = (): BookingVoucherStay => ({
  destination: '',
  check_in: '',
  check_out: '',
  acc_type: 'Hotel',
  acc_name: '',
  room_category: '',
  status: 'Confirmed',
});

const defaultPayload = (): BookingVoucherPayload => ({
  meal_plan: 'MAPAI',
  pax: 2,
  rooms: 1,
  nights: 4,
  extra_beds: 0,
  child_without_bed: 0,
  accommodations: [],
  payment_status: 'pending',
  advance_paid: 0,
  total_amount: 0,
});

type ItinOption = { id: string; title: string; customer_name: string; travel_start: string | null; travel_end: string | null; quote_price: number | null };

export default function CrmBookingVouchersManager() {
  const searchParams = useSearchParams();
  const prefillItineraryId = searchParams.get('itinerary') || '';

  const [rows, setRows] = useState<BookingVoucherRecord[]>([]);
  const [itineraries, setItineraries] = useState<ItinOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BookingVoucherRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [itineraryId, setItineraryId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [travelStart, setTravelStart] = useState('');
  const [travelEnd, setTravelEnd] = useState('');
  const [payload, setPayload] = useState<BookingVoucherPayload>(defaultPayload);
  const [cabs, setCabs] = useState<{ id: string; name: string; driver_name: string | null; driver_contact: string | null }[]>([]);
  const { showToast } = useToast();
  const minDate = todayYmd();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, iRes, cRes] = await Promise.all([
        supabase
          .from('crm_booking_vouchers')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(300),
        supabase
          .from('crm_itineraries')
          .select('id,title,customer_name,travel_start,travel_end,quote_price')
          .order('updated_at', { ascending: false })
          .limit(200),
        supabase.from('crm_cabs').select('id,name,driver_name,driver_contact').eq('status', 'active'),
      ]);
      if (vRes.error) throw vRes.error;
      setRows((vRes.data || []) as BookingVoucherRecord[]);
      setItineraries((iRes.data || []) as ItinOption[]);
      setCabs((cRes.data || []) as typeof cabs);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load vouchers', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const prefillDone = useRef(false);
  useEffect(() => {
    if (prefillDone.current || !prefillItineraryId || itineraries.length === 0) return;
    const it = itineraries.find((i) => i.id === prefillItineraryId);
    if (!it) return;
    prefillDone.current = true;
    void openCreateFromItinerary(it);
  }, [prefillItineraryId, itineraries]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.booking_id.toLowerCase().includes(s) ||
        r.customer_name.toLowerCase().includes(s) ||
        (r.customer_phone || '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  const resetForm = () => {
    setEditing(null);
    setBookingId('');
    setItineraryId('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setTravelStart('');
    setTravelEnd('');
    setPayload(defaultPayload());
  };

  const openCreateFromItinerary = async (it: ItinOption) => {
    resetForm();
    setItineraryId(it.id);
    setCustomerName(it.customer_name || 'Guest');
    setTravelStart(it.travel_start || '');
    setTravelEnd(it.travel_end || '');
    setBookingId(it.id.slice(0, 8).toUpperCase());
    const { data } = await supabase.from('crm_itineraries').select('sections,booking_voucher,quote_price,customer_phone,customer_email').eq('id', it.id).maybeSingle();
    if (data) {
      const row = data as Record<string, unknown>;
      setCustomerPhone(String(row.customer_phone || ''));
      setCustomerEmail(String(row.customer_email || ''));
      const bv = (row.booking_voucher || {}) as BookingVoucherPayload;
      setPayload({
        ...defaultPayload(),
        ...bv,
        total_amount: bv.total_amount ?? Number(row.quote_price) ?? 0,
      });
    }
    setOpen(true);
  };

  const openCreate = () => {
    resetForm();
    setBookingId(`BK-${String(Math.floor(Math.random() * 900000) + 100000)}`);
    setOpen(true);
  };

  const openEdit = (row: BookingVoucherRecord) => {
    setEditing(row);
    setBookingId(row.booking_id);
    setItineraryId(row.itinerary_id || '');
    setCustomerName(row.customer_name);
    setCustomerPhone(row.customer_phone || '');
    setCustomerEmail(row.customer_email || '');
    setTravelStart(row.travel_start || '');
    setTravelEnd(row.travel_end || '');
    setPayload(payloadFromVoucherRow(row));
    setOpen(true);
  };

  const setStay = (idx: number, patch: Partial<BookingVoucherStay>) => {
    const stays = [...(payload.accommodations || [])];
    stays[idx] = { ...stays[idx], ...patch };
    setPayload((p) => ({ ...p, accommodations: stays }));
  };

  const importFromItineraryNights = async () => {
    if (!itineraryId) {
      showToast('Link an itinerary first', 'error');
      return;
    }
    const { data } = await supabase.from('crm_itineraries').select('sections,travel_start').eq('id', itineraryId).maybeSingle();
    if (!data) return;
    const sections = normalizeItinerarySections((data as { sections: unknown }).sections as never);
    const nightStays = sections.night_stays;
    const ids = [...new Set(nightStays.map((s) => s.hotel_id).filter(Boolean) as string[])];
    if (ids.length === 0) {
      showToast('Assign hotels per night on the itinerary first', 'error');
      return;
    }
    const { data: hotels } = await supabase.from('crm_hotels').select('id,name,location,hotel_type').in('id', ids);
    const nameMap = new Map((hotels || []).map((h: { id: string; name: string; location: string | null; hotel_type: string | null }) => [h.id, h]));
    const stays: BookingVoucherStay[] = nightStays
      .filter((s) => s.hotel_id)
      .map((s) => {
        const h = nameMap.get(s.hotel_id!);
        return {
          destination: h?.location?.split(',')[0] || 'Kashmir',
          check_in: s.check_in || '',
          check_out: s.check_out || '',
          acc_type: h?.hotel_type === 'houseboat' ? 'Houseboat' : 'Hotel',
          acc_name: h?.name || '',
          room_category: s.room_category || '',
          status: 'Confirmed',
        };
      });
    setPayload((p) => ({
      ...p,
      accommodations: stays,
      nights: nightStays.length || p.nights,
      meal_plan: nightStays[0]?.meal_plan || p.meal_plan,
    }));
    showToast('Imported stays from itinerary night hotels', 'success');
  };

  const save = async () => {
    const bid = bookingId.trim();
    const name = customerName.trim();
    if (!bid || !name) {
      showToast('Booking ID and guest name are required', 'error');
      return;
    }
    const patch = rowPatchFromPayload(payload, {
      booking_id: bid,
      customer_name: name,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      itinerary_id: itineraryId || null,
      travel_start: travelStart || null,
      travel_end: travelEnd || null,
    });
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('crm_booking_vouchers').update(patch).eq('id', editing.id);
        if (error) throw error;
        showToast('Voucher updated', 'success');
      } else {
        const actor = await crmActorFields();
        const { error } = await supabase.from('crm_booking_vouchers').insert({ ...patch, ...actor, status: 'confirmed' });
        if (error) throw error;
        showToast('Voucher created', 'success');
      }
      await syncItineraryBookingVoucherJson(itineraryId || null, payload, payload.total_amount);
      setOpen(false);
      resetForm();
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: BookingVoucherRecord) => {
    if (!window.confirm(`Delete voucher ${row.booking_id}?`)) return;
    try {
      const { error } = await supabase.from('crm_booking_vouchers').delete().eq('id', row.id);
      if (error) throw error;
      showToast('Deleted', 'success');
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  const voucherPrintUrl = (id: string) => `/crm/manage-voucher/${id}/print`;

  return (
    <div className="crm-surface space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Ticket size={22} className="text-amber-700" />
            Booking confirmation vouchers
          </h2>
          <p className="text-sm text-gray-600 mt-1">Wintsum-style vouchers — link to itineraries, import night hotels, print PDF.</p>
        </div>
        <CrmButton variant="primary" onClick={openCreate}>
          <Plus size={16} /> New voucher
        </CrmButton>
      </div>

      <CrmInput label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Booking ID, guest name…" />

      {loading ? (
        <div className="space-y-2">
          <CrmSkeleton className="h-10 w-full" />
          <CrmSkeleton className="h-10 w-full" />
          <CrmSkeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={Ticket} title="No booking vouchers" description="Create one from an itinerary or add manually." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-bold text-amber-900">{r.booking_id}</p>
                  <p className="mt-1 font-extrabold text-gray-900">{r.customer_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {[r.travel_start, r.travel_end].filter(Boolean).join(' → ') || 'Dates TBD'}
                  </p>
                </div>
                <CrmBadge tone={r.payment_status === 'paid' ? 'success' : r.payment_status === 'partial' ? 'warning' : 'neutral'}>
                  {r.payment_status}
                </CrmBadge>
              </div>
              <p className="mt-3 text-lg font-bold text-teal-800">
                ₹ {Number(r.total_amount || 0).toLocaleString('en-IN')}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={voucherPrintUrl(r.id)} target="_blank">
                  <CrmButton variant="primary" size="sm">
                    <FileDown size={14} /> PDF
                  </CrmButton>
                </Link>
                <CrmButton variant="secondary" size="sm" onClick={() => openEdit(r)}>
                  <Pencil size={14} /> Edit
                </CrmButton>
                <CrmButton variant="danger" size="sm" onClick={() => void remove(r)}>
                  Delete
                </CrmButton>
              </div>
            </article>
          ))}
        </div>
      )}

      <CrmDialog open={open} onClose={() => setOpen(false)} title={editing ? 'Edit booking voucher' : 'New booking voucher'} wide>
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-amber-900 mb-3">1 · Link itinerary</h4>
            <CrmSelect
              label="Pull guest & dates from itinerary"
              value={itineraryId}
              onChange={(e) => {
                const id = e.target.value;
                setItineraryId(id);
                const it = itineraries.find((i) => i.id === id);
                if (it) {
                  setCustomerName(it.customer_name);
                  setTravelStart(it.travel_start || '');
                  setTravelEnd(it.travel_end || '');
                  if (!bookingId) setBookingId(it.id.slice(0, 8).toUpperCase());
                }
              }}
            >
              <option value="">— Select itinerary —</option>
              {itineraries.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.customer_name} — {it.title}
                </option>
              ))}
            </CrmSelect>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-3">2 · Guest details</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <CrmInput label="Voucher ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
              <CrmInput label="Guest name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <CrmInput label="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              <CrmInput label="Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
              <CrmInput label="Travel start" type="date" min={minDate} value={travelStart} onChange={(e) => setTravelStart(e.target.value)} />
              <CrmInput label="Travel end" type="date" min={minDate} value={travelEnd} onChange={(e) => setTravelEnd(e.target.value)} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-3">3 · Package & payment</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <CrmInput label="Meal plan" value={payload.meal_plan || ''} onChange={(e) => setPayload((p) => ({ ...p, meal_plan: e.target.value }))} />
              <CrmInput label="Pax" type="number" value={String(payload.pax ?? '')} onChange={(e) => setPayload((p) => ({ ...p, pax: Number(e.target.value) }))} />
              <CrmInput label="Rooms" type="number" value={String(payload.rooms ?? '')} onChange={(e) => setPayload((p) => ({ ...p, rooms: Number(e.target.value) }))} />
              <CrmInput label="Nights" type="number" value={String(payload.nights ?? '')} onChange={(e) => setPayload((p) => ({ ...p, nights: Number(e.target.value) }))} />
              <CrmInput label="Total (₹)" type="number" value={String(payload.total_amount ?? '')} onChange={(e) => setPayload((p) => ({ ...p, total_amount: Number(e.target.value) }))} />
              <CrmInput label="Advance (₹)" type="number" value={String(payload.advance_paid ?? '')} onChange={(e) => setPayload((p) => ({ ...p, advance_paid: Number(e.target.value) }))} />
              <CrmSelect label="Payment status" value={payload.payment_status || 'pending'} onChange={(e) => setPayload((p) => ({ ...p, payment_status: e.target.value }))}>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </CrmSelect>
            </div>
          </section>

          <section className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-teal-900">4 · Accommodation stays</h4>
              <div className="flex gap-2">
                <CrmButton variant="secondary" size="sm" onClick={() => void importFromItineraryNights()}>
                  Import from itinerary
                </CrmButton>
                <CrmButton
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setPayload((p) => ({
                      ...p,
                      accommodations: [...(p.accommodations || []), { ...emptyStay(), check_in: travelStart }],
                    }))
                  }
                >
                  + Add row
                </CrmButton>
              </div>
            </div>
            <div className="space-y-3">
              {(payload.accommodations || []).map((stay, idx) => (
                <div key={idx} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-500 mb-2">Stay {idx + 1}</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <CrmInput label="Destination" value={stay.destination} onChange={(e) => setStay(idx, { destination: e.target.value })} />
                    <CrmInput label="Check-in" type="date" min={minDate} value={stay.check_in} onChange={(e) => setStay(idx, { check_in: e.target.value })} />
                    <CrmInput label="Check-out" type="date" min={minDate} value={stay.check_out} onChange={(e) => setStay(idx, { check_out: e.target.value })} />
                    <CrmInput label="Acc. type" value={stay.acc_type} onChange={(e) => setStay(idx, { acc_type: e.target.value })} />
                    <CrmInput label="Hotel / houseboat" value={stay.acc_name} onChange={(e) => setStay(idx, { acc_name: e.target.value })} />
                    <CrmInput label="Room category" value={stay.room_category || ''} onChange={(e) => setStay(idx, { room_category: e.target.value })} />
                    <CrmInput label="Status" value={stay.status} onChange={(e) => setStay(idx, { status: e.target.value })} />
                  </div>
                </div>
              ))}
              {(payload.accommodations || []).length === 0 ? (
                <p className="text-sm text-teal-800/80 text-center py-4">No stays yet — import from itinerary or add a row.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-3">5 · Transport</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <CrmSelect
                label="Cab from catalog"
                value=""
                onChange={(e) => {
                  const cab = cabs.find((c) => c.id === e.target.value);
                  if (cab) setPayload((p) => ({ ...p, cab_name: cab.name, cab_driver: cab.driver_name || '', cab_contact: cab.driver_contact || '' }));
                }}
              >
                <option value="">— Select cab —</option>
                {cabs.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </CrmSelect>
              <CrmInput label="Cab name" value={payload.cab_name || ''} onChange={(e) => setPayload((p) => ({ ...p, cab_name: e.target.value }))} />
              <CrmInput label="Driver" value={payload.cab_driver || ''} onChange={(e) => setPayload((p) => ({ ...p, cab_driver: e.target.value }))} />
              <CrmInput label="Driver contact" value={payload.cab_contact || ''} onChange={(e) => setPayload((p) => ({ ...p, cab_contact: e.target.value }))} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-3">6 · Terms (PDF)</h4>
            <CrmTextarea rows={4} value={payload.terms_conditions || ''} onChange={(e) => setPayload((p) => ({ ...p, terms_conditions: e.target.value }))} />
          </section>

          {editing ? (
            <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-3">
              <Link href={voucherPrintUrl(editing.id)} target="_blank">
                <CrmButton variant="primary" size="sm"><Printer size={14} /> Preview PDF</CrmButton>
              </Link>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Booking voucher ${bookingId} — ${customerName}`)}`} target="_blank" rel="noopener noreferrer">
                <CrmButton variant="secondary" size="sm"><MessageCircle size={14} /> WhatsApp</CrmButton>
              </a>
              <a href={`mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent(`Booking voucher ${bookingId}`)}`}>
                <CrmButton variant="secondary" size="sm"><Mail size={14} /> Email</CrmButton>
              </a>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <CrmButton variant="secondary" onClick={() => setOpen(false)}>Cancel</CrmButton>
          <CrmButton variant="primary" onClick={() => void save()} disabled={saving}>
            {saving ? 'Saving…' : 'Save voucher'}
          </CrmButton>
        </div>
      </CrmDialog>
    </div>
  );
}
