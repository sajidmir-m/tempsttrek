-- Register public Storage bucket for CRM itinerary uploads (policies already in 20260511).
-- Without this row in storage.buckets, /object/public/itineraries/... returns 400 and Next/Image fails.

insert into storage.buckets (id, name, public)
values ('itineraries', 'itineraries', true)
on conflict (id) do update
set public = true,
    name = excluded.name;
