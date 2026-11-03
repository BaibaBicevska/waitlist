-- Allow the name + email sign-up form (no login) to join the waitlist.
-- Run once in Supabase dashboard → SQL Editor → New query → Run,
-- after 20261103000000_create_waitlist.sql.

-- Form sign-ups have no Supabase user, so user_id may be empty.
alter table public.waitlist alter column user_id drop not null;

-- Keep junk out: sane lengths, lowercase emails (so "A@x.com" = "a@x.com").
alter table public.waitlist
  add constraint waitlist_email_format
    check (email = lower(email) and char_length(email) <= 254 and email like '%_@_%.__%'),
  add constraint waitlist_name_length
    check (full_name is null or char_length(full_name) between 1 and 100);

-- Anyone may add a form row. They can't attach it to a user account.
create policy "Anyone can sign up with the form"
  on public.waitlist for insert
  to anon, authenticated
  with check (user_id is null);

-- A logged-in user may also see a form row made with their verified email.
drop policy "Users can see their own row" on public.waitlist;
create policy "Users can see their own row"
  on public.waitlist for select
  to authenticated
  using (user_id = auth.uid() or email = lower(auth.jwt() ->> 'email'));

-- Logged-out visitors may insert, but still never read the list.
grant insert on public.waitlist to anon;
