-- Offbeat: stable URLs + optional long copy for detail pages
alter table public.offbeat_spots add column if not exists slug text;
alter table public.offbeat_spots add column if not exists detail_body text;

create unique index if not exists offbeat_spots_slug_lower_idx on public.offbeat_spots (lower(slug))
where slug is not null and length(trim(slug)) > 0;

-- Site-wide social page JSON (managed from Admin → Social & videos)
alter table public.site_settings add column if not exists social_page jsonb not null default '{}'::jsonb;
