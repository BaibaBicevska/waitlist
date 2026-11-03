-- Waitlist: one row per Google user.
-- Run once in Supabase dashboard → SQL Editor → New query → Run.

create table public.waitlist (
  id         bigint generated always as identity primary key,
  user_id    uuid not null unique default auth.uid()
             references auth.users (id) on delete cascade,
  email      text not null unique,
  full_name  text,
  created_at timestamptz not null default now()
);

-- Lock the table: with RLS on and no policy, nobody can read or write.
alter table public.waitlist enable row level security;

-- A logged-in user may add only themselves, with the email from their login.
create policy "Users can join the waitlist themselves"
  on public.waitlist for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and email = (auth.jwt() ->> 'email')
  );

-- A logged-in user may read only their own row.
create policy "Users can see their own row"
  on public.waitlist for select
  to authenticated
  using (user_id = auth.uid());

-- Logged-out visitors get nothing; logged-in users only what the policies allow.
revoke all on public.waitlist from anon;
grant select, insert on public.waitlist to authenticated;
