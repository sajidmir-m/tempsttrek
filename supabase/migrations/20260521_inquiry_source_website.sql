-- Track where each inquiry/booking came from (website flows).

alter table public.inquiries add column if not exists source text;

comment on column public.inquiries.source is 'book-now | contact | package-booking | website';

-- Backfill from existing data
update public.inquiries
set source = 'package-booking'
where source is null and package_id is not null;

update public.inquiries
set source = 'website'
where source is null;
