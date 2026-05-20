/** Lead CRM constants and helpers */

export const LEAD_STATUSES = ['new', 'contacted', 'follow_up', 'converted', 'closed'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  follow_up: 'Follow-up',
  converted: 'Converted',
  closed: 'Closed',
};

export function leadStatusLabel(status: string | null | undefined): string {
  const s = (status || 'new') as LeadStatus;
  return LEAD_STATUS_LABELS[s] ?? status ?? 'New';
}

export const HOTEL_AVAILABILITY = ['available', 'limited', 'sold_out', 'inactive'] as const;
export type HotelAvailability = (typeof HOTEL_AVAILABILITY)[number];

export const HOTEL_AVAILABILITY_LABELS: Record<HotelAvailability, string> = {
  available: 'Available',
  limited: 'Limited',
  sold_out: 'Sold Out',
  inactive: 'Inactive',
};
