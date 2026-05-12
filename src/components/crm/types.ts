export type CRMItineraryStatus = 'draft' | 'sent' | 'confirmed' | 'archived';

export type ItineraryDay = {
  day: number;
  title: string;
  body: string;
};

export type ItinerarySections = {
  days: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  transfers: string;
  hotel_notes: string;
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
  created_at?: string;
  updated_at?: string;
};

export type CRMItineraryAssetRow = {
  id: string;
  itinerary_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at?: string;
};

