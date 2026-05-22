'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import type { BookingVoucherPayload, BookingVoucherStay } from '@/lib/crm-catalog';
import CrmInput from '../ui/CrmInput';
import CrmTextarea from '../ui/CrmTextarea';
import CrmSelect from '../ui/CrmSelect';
import CrmButton from '../ui/CrmButton';
import { FileDown, Mail, MessageCircle, Printer } from 'lucide-react';
import { SITE_CONTACT } from '@/lib/site-contact';
import { todayYmd } from '@/lib/crm-date-rules';
import type { ItineraryNightStay } from '../types';

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

export default function ItineraryBookingVoucherPanel({
  itineraryId,
  customerName,
  travelStart,
  travelEnd,
  quotePrice,
  bookingVoucher,
  nightStays = [],
  onSaved,
}: {
  itineraryId: string;
  customerName: string;
  travelStart: string | null;
  travelEnd?: string | null;
  quotePrice: number | null;
  bookingVoucher: BookingVoucherPayload | Record<string, unknown>;
  nightStays?: ItineraryNightStay[];
  onSaved: () => void;
}) {
  const minDate = todayYmd();
  const { showToast } = useToast();
  const [payload, setPayload] = useState<BookingVoucherPayload>(() => ({
    ...defaultPayload(),
    ...(bookingVoucher as BookingVoucherPayload),
    total_amount: (bookingVoucher as BookingVoucherPayload).total_amount ?? quotePrice ?? 0,
  }));
  const [bookingId, setBookingId] = useState('');
  const [cabs, setCabs] = useState<{ id: string; name: string; driver_name: string | null; driver_contact: string | null }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void supabase
      .from('crm_cabs')
      .select('id,name,driver_name,driver_contact')
      .eq('status', 'active')
      .then(({ data }) => setCabs((data || []) as typeof cabs));
  }, []);

  useEffect(() => {
    if (!itineraryId) return;
    setBookingId((prev) => prev || itineraryId.slice(0, 8).toUpperCase());
  }, [itineraryId]);

  const setStay = (idx: number, patch: Partial<BookingVoucherStay>) => {
    const stays = [...(payload.accommodations || [])];
    stays[idx] = { ...stays[idx], ...patch };
    setPayload((p) => ({ ...p, accommodations: stays }));
  };

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('crm_itineraries')
        .update({
          booking_voucher: payload,
          quote_price: payload.total_amount ?? quotePrice,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itineraryId);
      if (error) throw error;
      showToast('Booking voucher saved', 'success');
      onSaved();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }, [itineraryId, payload, quotePrice, onSaved, showToast]);

  const voucherUrl = `/crm/itineraries/${itineraryId}/voucher?booking_id=${encodeURIComponent(bookingId)}`;
  const waText = encodeURIComponent(
    `Booking confirmation — ${customerName}\nVoucher: ${bookingId}\nView: ${typeof window !== 'undefined' ? window.location.origin : ''}${voucherUrl}`
  );
  const mailHref = `mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent(`Booking voucher ${bookingId}`)}&body=${waText}`;

  const importFromNightHotels = async () => {
    const ids = [...new Set(nightStays.map((s) => s.hotel_id).filter(Boolean) as string[])];
    if (ids.length === 0) {
      showToast('Assign hotels per night first', 'error');
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
    showToast('Imported stays from night hotels', 'success');
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 sm:p-5">
      <h3 className="font-extrabold text-gray-900">Booking confirmation voucher</h3>
      <p className="text-xs text-gray-600 mt-1">Professional voucher PDF — guest, stays, cab, payment (Wintsum-style).</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <CrmInput label="Booking / Voucher ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
        <CrmInput label="Meal plan" value={payload.meal_plan || ''} onChange={(e) => setPayload((p) => ({ ...p, meal_plan: e.target.value }))} />
        <CrmInput label="Pax" type="number" value={String(payload.pax ?? '')} onChange={(e) => setPayload((p) => ({ ...p, pax: Number(e.target.value) }))} />
        <CrmInput label="Rooms" type="number" value={String(payload.rooms ?? '')} onChange={(e) => setPayload((p) => ({ ...p, rooms: Number(e.target.value) }))} />
        <CrmInput label="Nights" type="number" value={String(payload.nights ?? '')} onChange={(e) => setPayload((p) => ({ ...p, nights: Number(e.target.value) }))} />
        <CrmInput label="Extra beds" type="number" value={String(payload.extra_beds ?? '')} onChange={(e) => setPayload((p) => ({ ...p, extra_beds: Number(e.target.value) }))} />
        <CrmInput label="Child w/o bed" type="number" value={String(payload.child_without_bed ?? '')} onChange={(e) => setPayload((p) => ({ ...p, child_without_bed: Number(e.target.value) }))} />
        <CrmInput label="Total amount" type="number" value={String(payload.total_amount ?? '')} onChange={(e) => setPayload((p) => ({ ...p, total_amount: Number(e.target.value) }))} />
        <CrmInput label="Advance paid" type="number" value={String(payload.advance_paid ?? '')} onChange={(e) => setPayload((p) => ({ ...p, advance_paid: Number(e.target.value) }))} />
        <CrmSelect label="Payment status" value={payload.payment_status || 'pending'} onChange={(e) => setPayload((p) => ({ ...p, payment_status: e.target.value }))}>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </CrmSelect>
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

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <p className="text-xs font-bold uppercase text-gray-600">Accommodation rows</p>
          <div className="flex gap-2">
            <button type="button" className="text-xs font-bold text-amber-800" onClick={() => void importFromNightHotels()}>
              Import from night hotels
            </button>
            <button
              type="button"
              className="text-xs font-bold text-teal-700"
              onClick={() => setPayload((p) => ({ ...p, accommodations: [...(p.accommodations || []), { ...emptyStay(), check_in: travelStart || '' }] }))}
            >
              + Add stay
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {(payload.accommodations || []).map((stay, idx) => (
            <div key={idx} className="grid gap-2 rounded-xl border border-gray-200 bg-white p-3 sm:grid-cols-3 lg:grid-cols-6">
              <input className="border rounded-lg px-2 py-1.5 text-xs" placeholder="Destination" value={stay.destination} onChange={(e) => setStay(idx, { destination: e.target.value })} />
              <input type="date" min={minDate} className="border rounded-lg px-2 py-1.5 text-xs" value={stay.check_in} onChange={(e) => setStay(idx, { check_in: e.target.value })} />
              <input type="date" min={minDate} className="border rounded-lg px-2 py-1.5 text-xs" value={stay.check_out} onChange={(e) => setStay(idx, { check_out: e.target.value })} />
              <input className="border rounded-lg px-2 py-1.5 text-xs" placeholder="Type" value={stay.acc_type} onChange={(e) => setStay(idx, { acc_type: e.target.value })} />
              <input className="border rounded-lg px-2 py-1.5 text-xs" placeholder="Hotel name" value={stay.acc_name} onChange={(e) => setStay(idx, { acc_name: e.target.value })} />
              <input className="border rounded-lg px-2 py-1.5 text-xs" placeholder="Status" value={stay.status} onChange={(e) => setStay(idx, { status: e.target.value })} />
            </div>
          ))}
        </div>
      </div>

      <CrmTextarea
        label="Terms & conditions"
        className="mt-3"
        rows={4}
        value={payload.terms_conditions || ''}
        onChange={(e) => setPayload((p) => ({ ...p, terms_conditions: e.target.value }))}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrmButton variant="primary" size="sm" onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save voucher'}
        </CrmButton>
        <Link href={voucherUrl} target="_blank">
          <CrmButton variant="secondary" size="sm"><FileDown size={14} /> PDF / Print</CrmButton>
        </Link>
        <Link href={voucherUrl} target="_blank" onClick={(e) => { e.preventDefault(); window.open(voucherUrl, '_blank'); window.print(); }}>
          <CrmButton variant="secondary" size="sm"><Printer size={14} /> Print</CrmButton>
        </Link>
        <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer">
          <CrmButton variant="secondary" size="sm"><MessageCircle size={14} /> WhatsApp</CrmButton>
        </a>
        <a href={mailHref}>
          <CrmButton variant="secondary" size="sm"><Mail size={14} /> Email</CrmButton>
        </a>
      </div>
    </div>
  );
}
