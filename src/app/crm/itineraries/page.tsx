import ItineraryList from '@/components/crm/ItineraryList';
import { Suspense } from 'react';

export default function CrmItinerariesPage() {
  return (
    <Suspense fallback={<p className="text-gray-500 py-10">Loading…</p>}>
      <ItineraryList />
    </Suspense>
  );
}

