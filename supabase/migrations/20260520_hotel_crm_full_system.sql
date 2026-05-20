-- Hotel CRM full system: lead assignment, inquiry sync, hotel gallery, itinerary hotels, notifications.
-- Run after existing CRM migrations.

-- ---------------------------------------------------------------------------
-- Inquiries: extended fields + lead link
-- ---------------------------------------------------------------------------
alter table public.inquiries add column if not exists address text;
alter table public.inquiries add column if not exists hotel_requirement text;
alter table public.inquiries add column if not exists check_in date;
alter table public.inquiries add column if not exists check_out date;
alter table public.inquiries add column if not exists lead_id uuid references public.crm_leads(id) on delete set null;

create index if not exists idx_inquiries_lead_id on public.inquiries(lead_id);

-- ---------------------------------------------------------------------------
-- Leads: assignment, inquiry fields, follow-up, new statuses
-- ---------------------------------------------------------------------------
alter table public.crm_leads add column if not exists assigned_to uuid references auth.users(id) on delete set null;
alter table public.crm_leads add column if not exists inquiry_id uuid references public.inquiries(id) on delete set null;
alter table public.crm_leads add column if not exists address text;
alter table public.crm_leads add column if not exists hotel_requirement text;
alter table public.crm_leads add column if not exists check_in date;
alter table public.crm_leads add column if not exists check_out date;
alter table public.crm_leads add column if not exists message text;
alter table public.crm_leads add column if not exists follow_up_at timestamptz;

update public.crm_leads set status = 'follow_up' where status = 'quoted';
update public.crm_leads set status = 'converted' where status = 'confirmed';

alter table public.crm_leads drop constraint if exists crm_leads_status_check;
alter table public.crm_leads add constraint crm_leads_status_check
  check (status in ('new', 'contacted', 'follow_up', 'converted', 'closed'));

create index if not exists idx_crm_leads_assigned on public.crm_leads(assigned_to);
create index if not exists idx_crm_leads_status on public.crm_leads(status);
create index if not exists idx_crm_leads_follow_up on public.crm_leads(follow_up_at);

-- ---------------------------------------------------------------------------
-- Lead notes & call history
-- ---------------------------------------------------------------------------
create table if not exists public.crm_lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  body text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_lead_calls (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  called_at timestamptz not null default now(),
  duration_minutes int,
  outcome text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_lead_notes_lead on public.crm_lead_notes(lead_id, created_at desc);
create index if not exists idx_crm_lead_calls_lead on public.crm_lead_calls(lead_id, called_at desc);

-- ---------------------------------------------------------------------------
-- Hotels: public-facing + gallery
-- ---------------------------------------------------------------------------
alter table public.crm_hotels add column if not exists location text;
alter table public.crm_hotels add column if not exists price_per_night numeric(12, 2);
alter table public.crm_hotels add column if not exists amenities text[] default '{}';
alter table public.crm_hotels add column if not exists room_details text;
alter table public.crm_hotels add column if not exists description text;
alter table public.crm_hotels add column if not exists availability_status text not null default 'available'
  check (availability_status in ('available', 'limited', 'sold_out', 'inactive'));
alter table public.crm_hotels add column if not exists featured_image_url text;

create table if not exists public.crm_hotel_images (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.crm_hotels(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_hotel_images_hotel on public.crm_hotel_images(hotel_id, sort_order);

-- Itinerary ↔ hotel links (hotels added in CRM appear on itineraries)
create table if not exists public.crm_itinerary_hotels (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.crm_itineraries(id) on delete cascade,
  hotel_id uuid not null references public.crm_hotels(id) on delete cascade,
  day_number int,
  nights int default 1,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (itinerary_id, hotel_id, day_number)
);

create index if not exists idx_crm_itinerary_hotels_it on public.crm_itinerary_hotels(itinerary_id);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
create table if not exists public.crm_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'info' check (type in ('lead', 'inquiry', 'assignment', 'follow_up', 'info')),
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_notifications_user on public.crm_notifications(user_id, is_read, created_at desc);

-- ---------------------------------------------------------------------------
-- Site settings: branding (logo, contact, company) in home_content jsonb
-- ---------------------------------------------------------------------------
-- (home_content already jsonb on site_settings — no DDL change)

-- ---------------------------------------------------------------------------
-- Auto-create lead from inquiry
-- ---------------------------------------------------------------------------
create or replace function public.create_lead_from_inquiry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_lead_id uuid;
begin
  if new.lead_id is not null then
    return new;
  end if;

  insert into public.crm_leads (
    name, phone, email, source, destination, message,
    address, hotel_requirement, check_in, check_out,
    inquiry_id, status
  ) values (
    new.name,
    new.phone,
    new.email,
    coalesce(nullif(trim(coalesce(new.source, '')), ''), case when new.package_id is not null then 'package-booking' else 'website' end),
    nullif(trim(coalesce(new.hotel_requirement, '')), ''),
    new.message,
    new.address,
    new.hotel_requirement,
    new.check_in,
    new.check_out,
    new.id,
    'new'
  )
  returning id into new_lead_id;

  update public.inquiries set lead_id = new_lead_id where id = new.id;

  insert into public.crm_notifications (user_id, type, title, body, link)
  select
    p.id,
    'inquiry',
    'New inquiry: ' || new.name,
    coalesce(new.message, 'Website inquiry received'),
    '/crm/manage-inquiries'
  from public.profiles p
  where p.role = 'admin';

  return new;
end;
$$;

drop trigger if exists trg_inquiry_create_lead on public.inquiries;
create trigger trg_inquiry_create_lead
  after insert on public.inquiries
  for each row
  execute function public.create_lead_from_inquiry();

-- Notify assigned employee when lead assignment changes
create or replace function public.notify_lead_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.assigned_to is not null
     and (old.assigned_to is distinct from new.assigned_to) then
    insert into public.crm_notifications (user_id, type, title, body, link)
    values (
      new.assigned_to,
      'assignment',
      'Lead assigned to you',
      'Lead: ' || new.name,
      '/crm/manage-leads'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_lead_assignment_notify on public.crm_leads;
create trigger trg_lead_assignment_notify
  after update of assigned_to on public.crm_leads
  for each row
  execute function public.notify_lead_assignment();

-- ---------------------------------------------------------------------------
-- RLS: lead notes, calls, hotel images, itinerary hotels, notifications
-- ---------------------------------------------------------------------------
alter table public.crm_lead_notes enable row level security;
alter table public.crm_lead_calls enable row level security;
alter table public.crm_hotel_images enable row level security;
alter table public.crm_itinerary_hotels enable row level security;
alter table public.crm_notifications enable row level security;

-- Lead read: admin sees all; employees only assigned leads
drop policy if exists "crm_leads_staff_read" on public.crm_leads;
create policy "crm_leads_staff_read" on public.crm_leads for select
  using (
    public.get_my_role() = 'admin'
    or (public.get_my_role() = 'employee' and assigned_to = auth.uid())
  );

drop policy if exists "crm_leads_staff_write" on public.crm_leads;
drop policy if exists "crm_leads_staff_insert" on public.crm_leads;
create policy "crm_leads_staff_insert" on public.crm_leads for insert
  with check (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "crm_leads_staff_update" on public.crm_leads;
create policy "crm_leads_staff_update" on public.crm_leads for update
  using (
    public.get_my_role() = 'admin'
    or (public.get_my_role() = 'employee' and assigned_to = auth.uid())
  )
  with check (
    public.get_my_role() = 'admin'
    or (public.get_my_role() = 'employee' and assigned_to = auth.uid())
  );

-- Notes & calls: same visibility as parent lead
create policy "crm_lead_notes_staff" on public.crm_lead_notes for all
  using (
    exists (
      select 1 from public.crm_leads l
      where l.id = lead_id
        and (
          public.get_my_role() = 'admin'
          or (public.get_my_role() = 'employee' and l.assigned_to = auth.uid())
        )
    )
  )
  with check (
    exists (
      select 1 from public.crm_leads l
      where l.id = lead_id
        and (
          public.get_my_role() = 'admin'
          or (public.get_my_role() = 'employee' and l.assigned_to = auth.uid())
        )
    )
  );

create policy "crm_lead_calls_staff" on public.crm_lead_calls for all
  using (
    exists (
      select 1 from public.crm_leads l
      where l.id = lead_id
        and (
          public.get_my_role() = 'admin'
          or (public.get_my_role() = 'employee' and l.assigned_to = auth.uid())
        )
    )
  )
  with check (
    exists (
      select 1 from public.crm_leads l
      where l.id = lead_id
        and (
          public.get_my_role() = 'admin'
          or (public.get_my_role() = 'employee' and l.assigned_to = auth.uid())
        )
    )
  );

-- Hotel images
create policy "crm_hotel_images_staff" on public.crm_hotel_images for all
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));

-- Itinerary hotels
create policy "crm_itinerary_hotels_staff" on public.crm_itinerary_hotels for all
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));

-- Notifications: own rows only
create policy "crm_notifications_own" on public.crm_notifications for select
  using (user_id = auth.uid());
create policy "crm_notifications_own_update" on public.crm_notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "crm_notifications_insert_system" on public.crm_notifications for insert
  with check (true);

-- Storage: hotels folder in site-media bucket
insert into storage.buckets (id, name, public)
values ('hotels', 'hotels', true)
on conflict (id) do update set public = true;

drop policy if exists "hotels_bucket_public_read" on storage.objects;
create policy "hotels_bucket_public_read" on storage.objects for select
  using (bucket_id = 'hotels');

drop policy if exists "hotels_bucket_staff_write" on storage.objects;
create policy "hotels_bucket_staff_write" on storage.objects for all
  using (
    bucket_id = 'hotels'
    and public.get_my_role() in ('admin', 'employee')
  )
  with check (
    bucket_id = 'hotels'
    and public.get_my_role() in ('admin', 'employee')
  );
