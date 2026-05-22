'use client';

import CrmSimpleCatalogManager from '@/components/crm/catalog/CrmSimpleCatalogManager';
import { BedDouble } from 'lucide-react';

export default function ManageRoomCategoriesPage() {
  return (
    <CrmSimpleCatalogManager
      title="Room Categories"
      subtitle="Classic, Deluxe, Lake Facing Suite, Family Suite, etc."
      table="crm_room_categories"
      select="id,name,description,status,sort_order"
      icon={BedDouble}
      hasDescription
    />
  );
}
