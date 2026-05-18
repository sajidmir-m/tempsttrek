-- Align profiles with APIs (older projects may only have id, email, role, created_at).

alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Signup trigger: only touch columns that always exist (no updated_at dependency).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_role text;
begin
  desired_role := coalesce(
    nullif(trim(new.raw_user_meta_data->>'role'), ''),
    nullif(trim(new.raw_app_meta_data->>'role'), ''),
    'user'
  );
  if desired_role not in ('admin', 'employee', 'user') then
    desired_role := 'user';
  end if;

  insert into public.profiles (id, email, role)
  values (new.id, new.email, desired_role)
  on conflict (id) do update
    set
      email = excluded.email,
      role = case
        when public.profiles.role in ('admin', 'employee') then public.profiles.role
        else excluded.role
      end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
