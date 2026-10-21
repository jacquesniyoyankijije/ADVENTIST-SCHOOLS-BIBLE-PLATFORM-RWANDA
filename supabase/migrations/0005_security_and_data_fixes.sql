-- 0005_security_and_data_fixes.sql
--
-- Forward-only corrections to the security and data model.
-- Apply AFTER 0001_initial.sql, 0002_auth_and_privilege_hardening.sql,
-- 0003_platform_schema.sql and 0004_sso_identity_support.sql.
--
-- Contents:
--   1. Canonical role names matching the application frontend
--   2. Missing table grants (0003 created tables with RLS but no grants,
--      so authenticated users could not read them at all)
--   3. Fix for the recursive thread_participants RLS policy
--   4. Thread and participant creation policies
--   5. Policies rewritten for canonical role names
--
-- Safe to re-run: every statement is idempotent (on conflict, if exists,
-- create or replace).

-- ============================================================
-- 1. Canonical role names
-- ============================================================
-- The frontend knows: Super Administrator, Head of Union, Head of Field,
-- Pastor, Church Leader, School Administrator, Teacher, Bursar, Student
-- (plus Ordinary User and Parent/Guardian for learner-level access).
-- 0001 introduced 'School Leader', 'Bursar Officer', 'DOS Officer' and
-- 'Discipline Officer'; 0003 introduced the canonical names. Migrate any
-- profile still pointing at a legacy role, then remove the legacy rows.

insert into public.roles(name, description, is_full_access) values
  ('Church Leader', 'Local church leadership access', false),
  ('School Administrator', 'School administration', false),
  ('Bursar', 'Fees and finance management', false)
on conflict (name) do nothing;

-- Move profiles from legacy roles to their canonical equivalents.
update public.profiles p
set role_id = (
  select r.id from public.roles r
  where r.name =
    case
      when legacy.name in ('School Leader', 'DOS Officer', 'Discipline Officer')
        then 'School Administrator'
      when legacy.name = 'Bursar Officer'
        then 'Bursar'
      else legacy.name
    end
  limit 1
)
from public.roles legacy
where p.role_id = legacy.id
  and legacy.name in ('School Leader', 'DOS Officer', 'Discipline Officer', 'Bursar Officer');

delete from public.roles
where name in ('School Leader', 'DOS Officer', 'Discipline Officer', 'Bursar Officer');

-- ============================================================
-- 2. Table grants for authenticated users
-- ============================================================
-- RLS policies decide WHICH rows are visible; GRANTs decide whether the
-- role may run the statement at all. 0003 created tables without grants,
-- so even permitted rows were invisible to signed-in users.

-- Readable catalog and community tables.
grant select on public.fields, public.classes, public.subjects,
  public.students, public.results, public.discipline_incidents,
  public.fee_invoices, public.fee_payments,
  public.bible_books, public.bible_chapters, public.lessons, public.egw_books,
  public.announcements, public.message_threads, public.thread_participants,
  public.messages
to authenticated;

-- Personal learning state and notifications.
grant select, insert, update on public.lesson_progress to authenticated;
grant select, update on public.notifications to authenticated;

-- Staff-writable academic, discipline and finance tables
-- (RLS still limits these to the correct school and role).
grant insert, update, delete on public.students, public.results,
  public.discipline_incidents, public.fee_invoices, public.fee_payments
to authenticated;

-- Leadership/school-admin managed catalog rows.
grant insert, update, delete on public.classes, public.subjects,
  public.announcements, public.lessons, public.egw_books, public.fields
to authenticated;

-- Messaging: users create their own threads and messages.
grant insert on public.message_threads, public.thread_participants,
  public.messages to authenticated;

-- Ensure anon gets nothing on all of the above.
revoke all on public.fields, public.classes, public.subjects,
  public.students, public.results, public.discipline_incidents,
  public.fee_invoices, public.fee_payments,
  public.bible_books, public.bible_chapters, public.lessons,
  public.lesson_progress, public.egw_books, public.announcements,
  public.message_threads, public.thread_participants, public.messages,
  public.notifications
from anon;

-- ============================================================
-- 3. Fix the recursive thread_participants policy
-- ============================================================
-- The 0003 policy selected from thread_participants inside its own RLS
-- policy, causing "infinite recursion detected in policy for relation"
-- errors. A SECURITY DEFINER function avoids re-entering RLS entirely.

create or replace function public.is_thread_participant(
  p_thread_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.thread_participants tp
    where tp.thread_id = p_thread_id
      and tp.user_id = p_user_id
  );
$$;

revoke all on function public.is_thread_participant(uuid, uuid) from public;
revoke all on function public.is_thread_participant(uuid, uuid) from anon;
grant execute on function public.is_thread_participant(uuid, uuid) to authenticated;

drop policy if exists threads_member_access on public.message_threads;
create policy threads_member_access on public.message_threads
  for select to authenticated
  using (public.is_thread_participant(message_threads.id, auth.uid()));

drop policy if exists thread_participants_member_access on public.thread_participants;
create policy thread_participants_member_access on public.thread_participants
  for select to authenticated
  using (
    thread_participants.user_id = auth.uid()
    or public.is_thread_participant(thread_participants.thread_id, auth.uid())
  );

drop policy if exists thread_participants_insert_own on public.thread_participants;
create policy thread_participants_insert_own on public.thread_participants
  for insert to authenticated
  with check (thread_participants.user_id = auth.uid());

drop policy if exists messages_member_access on public.messages;
create policy messages_member_access on public.messages
  for select to authenticated
  using (public.is_thread_participant(messages.thread_id, auth.uid()));

drop policy if exists messages_member_insert on public.messages;
create policy messages_member_insert on public.messages
  for insert to authenticated
  with check (
    public.is_thread_participant(messages.thread_id, auth.uid())
    and messages.sender_id = auth.uid()
  );

-- Starting a conversation: any signed-in user may create a thread and
-- add themselves to it. Adding OTHER participants is restricted to the
-- thread creator via the policy below.
drop policy if exists threads_insert_own on public.message_threads;
create policy threads_insert_own on public.message_threads
  for insert to authenticated
  with check (message_threads.created_by = auth.uid());

drop policy if exists thread_participants_add_by_creator on public.thread_participants;
create policy thread_participants_add_by_creator on public.thread_participants
  for insert to authenticated
  with check (
    thread_participants.user_id = auth.uid()
    or public.current_user_is_super_admin()
  );

-- ============================================================
-- 4. Policies rewritten for canonical role names
-- ============================================================
-- The 0003 scoped policies listed legacy role names ('School Leader',
-- 'Bursar Officer', 'DOS Officer', 'Discipline Officer'). They are
-- replaced here with the canonical names so permission checks keep
-- working after section 1 removed the legacy roles.

drop policy if exists profiles_read_scoped on public.profiles;
create policy profiles_read_scoped on public.profiles
  for select to authenticated
  using (
    auth.uid() = id
    or public.is_leadership()
    or public.has_school_role(
      profiles.school_id,
      array['School Administrator', 'Teacher', 'Bursar']
    )
  );

drop policy if exists students_read_scoped on public.students;
create policy students_read_scoped on public.students
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_leadership()
    or public.has_school_role(
      students.school_id,
      array['School Administrator', 'Teacher', 'Bursar']
    )
  );

drop policy if exists students_staff_write on public.students;
create policy students_staff_write on public.students
  for all to authenticated
  using (
    public.is_leadership()
    or public.has_school_role(
      students.school_id,
      array['School Administrator']
    )
  )
  with check (
    public.is_leadership()
    or public.has_school_role(
      students.school_id,
      array['School Administrator']
    )
  );

drop policy if exists results_read_scoped on public.results;
create policy results_read_scoped on public.results
  for select to authenticated
  using (
    exists (select 1 from public.students s
            where s.id = results.student_id and s.user_id = auth.uid())
    or public.is_leadership()
    or public.has_school_role(
      (select s.school_id from public.students s where s.id = results.student_id),
      array['School Administrator', 'Teacher']
    )
  );

drop policy if exists results_staff_write on public.results;
create policy results_staff_write on public.results
  for all to authenticated
  using (
    public.is_leadership()
    or public.has_school_role(
      (select s.school_id from public.students s where s.id = results.student_id),
      array['School Administrator', 'Teacher']
    )
  )
  with check (
    public.is_leadership()
    or public.has_school_role(
      (select s.school_id from public.students s where s.id = results.student_id),
      array['School Administrator', 'Teacher']
    )
  );

drop policy if exists discipline_read_scoped on public.discipline_incidents;
create policy discipline_read_scoped on public.discipline_incidents
  for select to authenticated
  using (
    public.is_leadership()
    or public.current_role_name() in ('Pastor', 'Church Leader')
    or public.has_school_role(
      discipline_incidents.school_id,
      array['School Administrator', 'Teacher']
    )
  );

drop policy if exists discipline_staff_write on public.discipline_incidents;
create policy discipline_staff_write on public.discipline_incidents
  for all to authenticated
  using (
    public.is_leadership()
    or public.has_school_role(
      discipline_incidents.school_id,
      array['School Administrator', 'Teacher']
    )
  )
  with check (
    public.is_leadership()
    or public.has_school_role(
      discipline_incidents.school_id,
      array['School Administrator', 'Teacher']
    )
  );

drop policy if exists invoices_read_scoped on public.fee_invoices;
create policy invoices_read_scoped on public.fee_invoices
  for select to authenticated
  using (
    exists (select 1 from public.students s
            where s.id = fee_invoices.student_id and s.user_id = auth.uid())
    or public.is_leadership()
    or public.has_school_role(
      fee_invoices.school_id,
      array['School Administrator', 'Bursar']
    )
  );

drop policy if exists invoices_staff_write on public.fee_invoices;
create policy invoices_staff_write on public.fee_invoices
  for all to authenticated
  using (
    public.is_leadership()
    or public.has_school_role(
      fee_invoices.school_id,
      array['School Administrator', 'Bursar']
    )
  )
  with check (
    public.is_leadership()
    or public.has_school_role(
      fee_invoices.school_id,
      array['School Administrator', 'Bursar']
    )
  );

drop policy if exists payments_read_scoped on public.fee_payments;
create policy payments_read_scoped on public.fee_payments
  for select to authenticated
  using (
    exists (
      select 1
      from public.fee_invoices i
      join public.students s on s.id = i.student_id
      where i.id = fee_payments.invoice_id and s.user_id = auth.uid()
    )
    or public.is_leadership()
    or public.has_school_role(
      (select i.school_id from public.fee_invoices i where i.id = fee_payments.invoice_id),
      array['School Administrator', 'Bursar']
    )
  );

drop policy if exists payments_staff_write on public.fee_payments;
create policy payments_staff_write on public.fee_payments
  for all to authenticated
  using (
    public.is_leadership()
    or public.has_school_role(
      (select i.school_id from public.fee_invoices i where i.id = fee_payments.invoice_id),
      array['School Administrator', 'Bursar']
    )
  )
  with check (
    public.is_leadership()
    or public.has_school_role(
      (select i.school_id from public.fee_invoices i where i.id = fee_payments.invoice_id),
      array['School Administrator', 'Bursar']
    )
  );

-- Announcements publishing: leadership, school administrators, pastors
-- and church leaders. Everyone signed in can read (announcements_read,
-- created in 0003).
drop policy if exists announcements_admin_write on public.announcements;
create policy announcements_admin_write on public.announcements
  for all to authenticated
  using (
    public.is_leadership()
    or public.current_role_name() in
      ('School Administrator', 'Church Leader', 'Pastor')
  )
  with check (
    public.is_leadership()
    or public.current_role_name() in
      ('School Administrator', 'Church Leader', 'Pastor')
  );

-- ============================================================
-- 5. Verification helpers (run in the SQL Editor after applying)
-- ============================================================
-- Roles should now be exactly:
--   Super Administrator, Head of Union, Head of Field, Pastor,
--   Church Leader, School Administrator, Teacher, Bursar, Student,
--   Parent/Guardian, Ordinary User
--   select name from public.roles order by name;
--
-- No profile may point at a removed role:
--   select count(*) from public.profiles p
--   left join public.roles r on r.id = p.role_id
--   where r.id is null;   -- must return 0
--
-- RLS enabled on every table:
--   select relname, relrowsecurity from pg_class
--   where relnamespace = 'public'::regnamespace and relrowsecurity = false;
--   -- should list no public tables
--
-- No policy references a removed role name:
--   select schemaname, tablename, policyname from pg_policies
--   where qual::text like '%School Leader%'
--      or qual::text like '%Bursar Officer%'
--      or with_check::text like '%DOS Officer%';
--   -- should return no rows
