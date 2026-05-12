-- CRM dashboard seed data (run after migrations)
-- Uses generated UUIDs and CTEs to relate leads → quotations → followups/arrivals.

with
lead1 as (
  insert into public.crm_leads (name, phone, email, source, destination, budget, duration, status)
  values ('Ayaan Khan', '9906000001', 'ayaan@example.com', 'Instagram', 'Gulmarg • Pahalgam', 65000, '5D/4N', 'quoted')
  returning id
),
lead2 as (
  insert into public.crm_leads (name, phone, email, source, destination, budget, duration, status)
  values ('Ishita Sharma', '9906000002', 'ishita@example.com', 'Facebook', 'Srinagar • Sonamarg', 48000, '4D/3N', 'contacted')
  returning id
),
lead3 as (
  insert into public.crm_leads (name, phone, email, source, destination, budget, duration, status)
  values ('Bilal Ahmad', '9906000003', 'bilal@example.com', 'Referral', 'Gurez Valley', 72000, '6D/5N', 'quoted')
  returning id
),
q1 as (
  insert into public.crm_quotations (lead_id, quote_id, duration, budget, destination, status, remark)
  select id, 'Q-2026-0001', '5D/4N', 65000, 'Gulmarg • Pahalgam', 'sent', 'Sent itinerary + hotel options'
  from lead1
  returning id
),
q2 as (
  insert into public.crm_quotations (lead_id, quote_id, duration, budget, destination, status, remark)
  select id, 'Q-2026-0002', '4D/3N', 48000, 'Srinagar • Sonamarg', 'draft', 'Waiting for travel dates'
  from lead2
  returning id
),
q3 as (
  insert into public.crm_quotations (lead_id, quote_id, duration, budget, destination, status, remark)
  select id, 'Q-2026-0003', '6D/5N', 72000, 'Gurez Valley', 'sent', 'Driver + stay + permits discussed'
  from lead3
  returning id
)
insert into public.crm_followups (quotation_id, followup_at, remark, status)
select id, date_trunc('day', now()) + interval '11 hours', 'Follow up for confirmation', 'pending' from q1
union all
select id, date_trunc('day', now()) + interval '16 hours', 'Share updated quote if needed', 'pending' from q3
union all
select id, now() - interval '6 hours', 'Missed follow-up: call again', 'pending' from q2;

-- Arrivals for today and tomorrow
with q as (
  select id, destination from public.crm_quotations where quote_id in ('Q-2026-0001','Q-2026-0003') limit 2
),
qrows as (
  select * from q
)
insert into public.crm_arrivals (quotation_id, arrival_date, destination, status)
select (select id from public.crm_quotations where quote_id = 'Q-2026-0001'), current_date, 'Gulmarg', 'scheduled'
union all
select (select id from public.crm_quotations where quote_id = 'Q-2026-0003'), current_date + 1, 'Gurez Valley', 'scheduled';

