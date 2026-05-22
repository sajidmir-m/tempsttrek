'use client';

import { Suspense, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/** Legacy URL — redirect to Manage Voucher print when a linked record exists. */
function VoucherRedirectInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const itineraryId = typeof params?.id === 'string' ? params.id : '';
  const bookingIdParam = searchParams.get('booking_id') || '';

  useEffect(() => {
    if (!itineraryId) return;
    void (async () => {
      let q = supabase.from('crm_booking_vouchers').select('id,booking_id').eq('itinerary_id', itineraryId);
      if (bookingIdParam) q = q.eq('booking_id', bookingIdParam);
      const { data: rows } = await q.order('updated_at', { ascending: false }).limit(1);
      const data = rows?.[0] as { id: string; booking_id: string } | undefined;
      if (data?.id) {
        router.replace(`/crm/manage-voucher/${data.id}/print`);
        return;
      }
      router.replace(`/crm/manage-voucher?itinerary=${itineraryId}`);
    })();
  }, [itineraryId, bookingIdParam, router]);

  return <div className="flex min-h-screen items-center justify-center bg-white text-sm">Redirecting to booking voucher…</div>;
}

export default function ItineraryVoucherPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <VoucherRedirectInner />
    </Suspense>
  );
}
