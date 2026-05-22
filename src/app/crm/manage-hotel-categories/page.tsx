'use client';

import CrmSimpleCatalogManager from '@/components/crm/catalog/CrmSimpleCatalogManager';
import { Tags } from 'lucide-react';

export default function ManageHotelCategoriesPage() {
  return (
    <CrmSimpleCatalogManager
      title="Hotel Categories"
      subtitle="Deluxe, Premium, Luxury, Budget, Houseboat Premium, etc."
      table="crm_hotel_categories"
      select="id,name,status,sort_order"
      icon={Tags}
    />
  );
}
