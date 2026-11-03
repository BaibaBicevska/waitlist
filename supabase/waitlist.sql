-- SnoozeCast waitlist: one table for everyone who joins,
-- by "Join with Google" or by the name + email form.
--
-- Run in Supabase dashboard → SQL Editor → New query → Run.
-- ⚠️ The first line deletes any existing waitlist table AND ITS ROWS.

drop table if exists public.waitlist cascade;

create table public.waitlist (
  id         bigint generated always as identity primary key,
  full_name  text check (full_name is null or char_length(full_name) between 1 and 100),
  email      text not null unique
             check (email = lower(email)
                    and char_length(email) <= 54
                    and email like '%_@_%.__%'),
  source     text not null check (source in ('google', 'form')),
  -- Only set for Google sign-ups: links the row to Authentication → Users.
  user_id    uuid unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  -- Google rows must have a user; form rows must not.
  constraint waitlist_source_user check (
    (source = 'google' and user_id is not null) or
    (source = 'form' and user_id is null)
  )
);

-- Row Level Security: with no matching policy, nobody can read or write.
alter table public.waitlist enable row level security;

-- Form: anyone may add a row, but can't attach it to a user account.
create policy "Anyone can join with the form"
  on public.waitlist for insert
  to anon, authenticated
  with check (source = 'form' and user_id is null);

-- Google: a logged-in user may add only themselves, with their real email.
create policy "Users can join with Google"
  on public.waitlist for insert
  to authenticated
  with check (
    source = 'google'
    and user_id = auth.uid()
    and email = lower(auth.jwt() ->> 'email')
  );

-- A logged-in user may read only their own row (by account or verified email).
-- Nobody else can read the list from the app; you see it in Table Editor.
create policy "Users can see their own row"
  on public.waitlist for select
  to authenticated
  using (user_id = auth.uid() or email = lower(auth.jwt() ->> 'email'));

revoke all on public.waitlist from anon, authenticated;
grant insert on public.waitlist to anon;
grant select, insert on public.waitlist to authenticated;
