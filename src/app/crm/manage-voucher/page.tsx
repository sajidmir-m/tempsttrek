'use client';

import { Suspense } from 'react';
import CrmBookingVouchersManager from '@/components/crm/vouchers/CrmBookingVouchersManager';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading vouchers…</div>}>
      <CrmBookingVouchersManager />
    </Suspense>
  );
}
