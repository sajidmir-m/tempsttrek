-- Staff accounts: soft-disable + CRM user-management audit trail

alter table public.profiles
  add column if not exists is_active boolean not null default true;

comment on column public.profiles.is_active is 'When false, portal and CRM access are blocked (soft-disable).';

create table if not exists public.crm_staff_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text,
  target_user_id uuid not null,
  target_email text,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_staff_audit_created on public.crm_staff_audit (created_at desc);
create index if not exists idx_crm_staff_audit_target on public.crm_staff_audit (target_user_id);

alter table public.crm_staff_audit enable row level security;

drop policy if exists "crm_staff_audit_admin_select" on public.crm_staff_audit;
create policy "crm_staff_audit_admin_select"
on public.crm_staff_audit for select
using (public.get_my_role() = 'admin');

drop policy if exists "crm_staff_audit_admin_insert" on public.crm_staff_audit;
create policy "crm_staff_audit_admin_insert"
on public.crm_staff_audit for insert
with check (public.get_my_role() = 'admin');
