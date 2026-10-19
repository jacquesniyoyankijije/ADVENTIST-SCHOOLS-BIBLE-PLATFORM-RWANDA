-- 0003_platform_schema.sql
-- Full platform data model: academic, discipline, finance, communication,
-- Bible learning and audit domains, with Row Level Security throughout.
-- Apply AFTER 0001_initial.sql and 0002_auth_and_privilege_hardening.sql.
--
-- Roles come from the public.roles catalog (extended below). Privileged
-- writes rely on the RLS policies here; the 0002 trigger keeps protecting
-- profiles.role_id / school_id from self-service changes.

-- ============================================================
-- 1. Catalog roles used by the platform UI
-- ============================================================
insert into public.roles(name, description, is_full_access) values
('Church Leader','Local church leadership access',false),
('School Administrator','School administration',false),
('Bursar','Fees and finance management',false)
on conflict(name) do nothing;

-- ============================================================
-- 2. Role helpers (catalog-based, mirroring 0002)
-- ============================================================
create or replace function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role_name() = 'Super Administrator', false)
$$;

create or replace function public.is_leadership()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_role_name() in
      ('Super Administrator', 'Head of Union', 'Head of Field'),
    false
  )
$$;

-- True when the caller holds one of the listed roles at the given school.
create or replace function public.has_school_role(school uuid, names text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = auth.uid()
      and p.school_id = school
      and r.name = any(names)
  )
$$;

-- ============================================================
-- 3. Reference data: fields and schools
-- ============================================================
create table if not exists public.fields (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  head_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.schools
  add column if not exists field_id uuid references public.fields(id) on delete set null,
  add column if not exists head_of_school text,
  add column if not exists status text not null default 'Active'
    check (status in ('Active', 'Review', 'Archived'));

-- ============================================================
-- 4. Academic domain
-- ============================================================
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,           -- e.g. "Senior 5"
  academic_year text not null default '2026',
  teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_code text unique not null,     -- e.g. ASB-2025-0148
  full_name text not null,
  school_id uuid not null references public.schools(id) on delete restrict,
  class_id uuid references public.classes(id) on delete set null,
  guardian_name text,
  guardian_phone text,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'Active'
    check (status in ('Active', 'Support', 'Transferred', 'Graduated', 'Archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,           -- e.g. Religious Studies, Mathematics
  school_id uuid references public.schools(id) on delete cascade
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  term text not null default 'Term II',
  academic_year text not null default '2026',
  score numeric not null check (score >= 0 and score <= 100),
  status text not null default 'Draft'
    check (status in ('Draft', 'Review', 'Approved', 'Published')),
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists results_student_idx on public.results(student_id);

-- ============================================================
-- 5. Discipline domain (confidential — RLS is critical here)
-- ============================================================
create table if not exists public.discipline_incidents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  category text not null
    check (category in ('Attendance', 'Conduct', 'Uniform', 'Academic', 'Safety', 'Other')),
  description text,
  occurred_on date not null default current_date,
  school_id uuid not null references public.schools(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  status text not null default 'Open'
    check (status in ('Open', 'Follow-up', 'Resolved', 'Escalated')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. Finance / bursar domain
-- ============================================================
create table if not exists public.fee_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_code text unique not null,      -- e.g. INV-1082
  student_id uuid not null references public.students(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  term text not null default 'Term II',
  academic_year text not null default '2026',
  total_due numeric not null check (total_due >= 0),
  status text not null default 'Partial'
    check (status in ('Draft', 'Partial', 'Paid', 'Overdue', 'Waived')),
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.fee_invoices(id) on delete cascade,
  amount numeric not null check (amount > 0),
  paid_on date not null default current_date,
  method text not null default 'Bank' check (method in ('Bank', 'MOMO', 'Cash', 'Other')),
  reference text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. Bible learning domain
-- ============================================================
-- Rights note: only insert Bible/EGW text you are licensed to distribute.
create table if not exists public.bible_books (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  testament text not null check (testament in ('Old', 'New')),
  chapter_count int not null,
  position int not null
);

create table if not exists public.bible_chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.bible_books(id) on delete cascade,
  chapter int not null,
  translation text not null default 'KJV',
  verses jsonb not null,          -- [{n:1,text:"..."}, ...]
  license text,
  unique (book_id, chapter, translation)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  term text not null default 'Term II',
  week int,
  duration_minutes int not null default 20,
  sections jsonb,                 -- structured lesson content
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  completed_at timestamptz,
  unique (lesson_id, user_id)
);

create table if not exists public.egw_books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  cover_url text,
  source_url text,
  license text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 8. Communication domain
-- ============================================================
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'All schools',
  tone text not null default 'blue' check (tone in ('gold', 'blue', 'green')),
  author_id uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now()
);

create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  subject text not null default 'Conversation',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.thread_participants (
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (thread_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists messages_thread_idx on public.messages(thread_id, created_at);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  detail text,
  kind text not null default 'general'
    check (kind in ('general', 'message', 'finance', 'security', 'academic')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, read);

-- ============================================================
-- 9. Audit insert helper
-- ============================================================
-- system_audit_logs exists since 0001; 0002 restricts reads to super admins.
create or replace function public.audit(action text, entity_type text, entity_id uuid, details jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.system_audit_logs(actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), action, entity_type, entity_id, details);
end
$$;

-- ============================================================
-- 10. Row Level Security
-- ============================================================
alter table public.fields                enable row level security;
alter table public.classes               enable row level security;
alter table public.students              enable row level security;
alter table public.subjects              enable row level security;
alter table public.results               enable row level security;
alter table public.discipline_incidents  enable row level security;
alter table public.fee_invoices          enable row level security;
alter table public.fee_payments          enable row level security;
alter table public.bible_books           enable row level security;
alter table public.bible_chapters        enable row level security;
alter table public.lessons               enable row level security;
alter table public.lesson_progress       enable row level security;
alter table public.egw_books             enable row level security;
alter table public.announcements         enable row level security;
alter table public.message_threads       enable row level security;
alter table public.thread_participants   enable row level security;
alter table public.messages              enable row level security;
alter table public.notifications         enable row level security;

-- Profiles: extend 0002 policies so school staff can read colleagues
-- within their own school, and leadership can read everyone.
create policy profiles_read_scoped on public.profiles
  for select to authenticated
  using (
    auth.uid() = id
    or public.is_leadership()
    or public.has_school_role(
      profiles.school_id,
      array['School Administrator', 'School Leader', 'Teacher',
            'Bursar', 'Bursar Officer', 'DOS Officer', 'Discipline Officer']
    )
  );

-- Public reference content: readable by any signed-in user.
create policy fields_read on public.fields for select to authenticated using (true);
create policy classes_read on public.classes for select to authenticated using (true);
create policy subjects_read on public.subjects for select to authenticated using (true);
create policy bible_read on public.bible_books for select to authenticated using (true);
create policy bible_chapters_read on public.bible_chapters for select to authenticated using (true);
create policy lessons_read on public.lessons for select to authenticated using (true);
create policy egw_read on public.egw_books for select to authenticated using (true);
create policy announcements_read on public.announcements for select to authenticated using (true);

-- Administrative writes (schools, classes, subjects, announcements, lessons).
-- (0002 already adds granular schools admin insert/update/delete policies;
-- this general policy keeps leadership write access in one place.)
create policy schools_leadership_write on public.schools
  for all to authenticated
  using (public.is_leadership())
  with check (public.is_leadership());

create policy classes_admin_write on public.classes
  for all to authenticated
  using (public.is_leadership())
  with check (public.is_leadership());

create policy subjects_admin_write on public.subjects
  for all to authenticated
  using (public.is_leadership())
  with check (public.is_leadership());

create policy announcements_admin_write on public.announcements
  for all to authenticated
  using (
    public.is_leadership()
    or public.current_role_name() in ('School Administrator', 'Church Leader', 'Pastor')
  )
  with check (
    public.is_leadership()
    or public.current_role_name() in ('School Administrator', 'Church Leader', 'Pastor')
  );

create policy lessons_admin_write on public.lessons
  for all to authenticated
  using (
    public.is_leadership()
    or public.current_role_name() in ('Teacher', 'School Administrator', 'School Leader')
  )
  with check (
    public.is_leadership()
    or public.current_role_name() in ('Teacher', 'School Administrator', 'School Leader')
  );

-- Students: staff read/write within their school; students read their own record.
create policy students_read_scoped on public.students
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_leadership()
    or public.has_school_role(
      students.school_id,
      array['School Administrator', 'School Leader', 'Teacher',
            'Bursar', 'Bursar Officer']
    )
  );

create policy students_staff_write on public.students
  for all to authenticated
  using (
    public.is_leadership()
    or public.has_school_role(
      students.school_id,
      array['School Administrator', 'School Leader']
    )
  )
  with check (
    public.is_leadership()
    or public.has_school_role(
      students.school_id,
      array['School Administrator', 'School Leader']
    )
  );

-- Results: teachers/admins manage within their school; students read their own.
create policy results_read_scoped on public.results
  for select to authenticated
  using (
    exists (select 1 from public.students s
            where s.id = results.student_id and s.user_id = auth.uid())
    or public.is_leadership()
    or public.has_school_role(
      (select s.school_id from public.students s where s.id = results.student_id),
      array['School Administrator', 'School Leader', 'Teacher', 'DOS Officer']
    )
  );

create policy results_staff_write on public.results
  for all to authenticated
  using (
    public.is_leadership()
    or public.has_school_role(
      (select s.school_id from public.students s where s.id = results.student_id),
      array['School Administrator', 'School Leader', 'Teacher', 'DOS Officer']
    )
  )
  with check (
    public.is_leadership()
    or public.has_school_role(
      (select s.school_id from public.students s where s.id = results.student_id),
      array['School Administrator', 'School Leader', 'Teacher', 'DOS Officer']
    )
  );

-- Discipline: strictly confidential — leadership, pastors and authorized
-- school staff only.
create policy discipline_read_scoped on public.discipline_incidents
  for select to authenticated
  using (
    public.is_leadership()
    or public.current_role_name() in ('Pastor', 'Discipline Officer')
    or public.has_school_role(
      discipline_incidents.school_id,
      array['School Administrator', 'School Leader', 'Teacher', 'Discipline Officer']
    )
  );

create policy discipline_staff_write on public.discipline_incidents
  for all to authenticated
  using (
    public.is_leadership()
    or public.has_school_role(
      discipline_incidents.school_id,
      array['School Administrator', 'School Leader', 'Teacher', 'Discipline Officer']
    )
  )
  with check (
    public.is_leadership()
    or public.has_school_role(
      discipline_incidents.school_id,
      array['School Administrator', 'School Leader', 'Teacher', 'Discipline Officer']
    )
  );

-- Finance: bursar + school admin within school; leadership everywhere;
-- students (and via them, guardians) read their own invoices/payments.
create policy invoices_read_scoped on public.fee_invoices
  for select to authenticated
  using (
    exists (select 1 from public.students s
            where s.id = fee_invoices.student_id and s.user_id = auth.uid())
    or public.is_leadership()
    or public.has_school_role(
      fee_invoices.school_id,
      array['School Administrator', 'School Leader', 'Bursar', 'Bursar Officer']
    )
  );

create policy invoices_staff_write on public.fee_invoices
  for all to authenticated
  using (
    public.is_leadership()
    or public.has_school_role(
      fee_invoices.school_id,
      array['School Administrator', 'School Leader', 'Bursar', 'Bursar Officer']
    )
  )
  with check (
    public.is_leadership()
    or public.has_school_role(
      fee_invoices.school_id,
      array['School Administrator', 'School Leader', 'Bursar', 'Bursar Officer']
    )
  );

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
      array['School Administrator', 'School Leader', 'Bursar', 'Bursar Officer']
    )
  );

create policy payments_staff_write on public.fee_payments
  for all to authenticated
  using (
    public.is_leadership()
    or public.has_school_role(
      (select i.school_id from public.fee_invoices i where i.id = fee_payments.invoice_id),
      array['School Administrator', 'School Leader', 'Bursar', 'Bursar Officer']
    )
  )
  with check (
    public.is_leadership()
    or public.has_school_role(
      (select i.school_id from public.fee_invoices i where i.id = fee_payments.invoice_id),
      array['School Administrator', 'School Leader', 'Bursar', 'Bursar Officer']
    )
  );

-- Messaging: participants only.
create policy threads_member_access on public.message_threads
  for select to authenticated
  using (exists (
    select 1 from public.thread_participants tp
    where tp.thread_id = message_threads.id and tp.user_id = auth.uid()
  ));

create policy thread_participants_member_access on public.thread_participants
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.thread_participants tp
      where tp.thread_id = thread_participants.thread_id and tp.user_id = auth.uid()
    )
  );

create policy messages_member_access on public.messages
  for select to authenticated
  using (exists (
    select 1
    from public.thread_participants tp
    where tp.thread_id = messages.thread_id and tp.user_id = auth.uid()
  ));

create policy messages_member_insert on public.messages
  for insert to authenticated
  with check (exists (
    select 1
    from public.thread_participants tp
    where tp.thread_id = messages.thread_id and tp.user_id = auth.uid()
  ) and sender_id = auth.uid());

-- Notifications and lesson progress: own rows only.
create policy notifications_own on public.notifications
  for select to authenticated using (user_id = auth.uid());

create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy progress_own_read on public.lesson_progress
  for select to authenticated using (user_id = auth.uid());

create policy progress_own_write on public.lesson_progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Audit logs: 0002 already restricts reads to super admins. Allow
-- authenticated users to append entries about their own actions only.
create policy audit_insert_own on public.system_audit_logs
  for insert to authenticated with check (actor_id = auth.uid());

-- ============================================================
-- 11. updated_at maintenance
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists students_touch on public.students;
create trigger students_touch before update on public.students
  for each row execute function public.touch_updated_at();
