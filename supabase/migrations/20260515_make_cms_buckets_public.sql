-- Ensure CMS/media buckets are public so uploaded files can preview on public pages.
-- Without this, getPublicUrl() returns a URL but fetches can fail with 400/401.

insert into storage.buckets (id, name, public)
values
  ('site-media', 'site-media', true),
  ('packages', 'packages', true),
  ('places', 'places', true),
  ('cars', 'cars', true),
  ('cabs', 'cabs', true)
on conflict (id) do update
set public = true,
    name = excluded.name;
