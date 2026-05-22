export type CRMItineraryStatus = 'draft' | 'sent' | 'confirmed' | 'archived';

export type ItineraryNightStay = {
  night: number;
  hotel_id: string | null;
  room_category?: string;
  meal_plan?: string;
  check_in?: string;
  check_out?: string;
};

export type ItineraryDay = {
  day: number;
  title: string;
  body: string;
  destination_ids?: string[];
};

export type ItineraryPackageSummary = {
  pax?: number;
  adults?: number;
  children?: number;
  rooms?: number;
  flights_included?: boolean;
};

export type ItinerarySections = {
  days: ItineraryDay[];
  night_stays: ItineraryNightStay[];
  inclusions: string[];
  exclusions: string[];
  transfers: string;
  hotel_notes: string;
  disclaimer?: string;
  terms_conditions?: string;
  cancellation_policy?: string;
  how_to_reach?: string;
  package_summary?: ItineraryPackageSummary;
};

export type CRMItineraryRow = {
  id: string;
  title: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  travel_start: string | null;
  travel_end: string | null;
  status: CRMItineraryStatus;
  itinerary_body: string;
  internal_notes: string | null;
  sections: ItinerarySections | Record<string, unknown> | null;
  cover_image_url: string | null;
  quote_price?: number | null;
  itinerary_number?: string | null;
  booking_voucher?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};

export type CRMItineraryAssetKind = 'general' | 'hotel' | 'cab' | 'place';

export type CRMItineraryAssetRow = {
  id: string;
  itinerary_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  /** null = top highlights gallery; 1..N = show after day N */
  after_day: number | null;
  kind: CRMItineraryAssetKind | null;
  created_at?: string;
};

