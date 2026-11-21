-- =====================================================================
-- Bilim Ko'prik — Supabase ma'lumotlar bazasi sxemasi
-- Supabase Dashboard → SQL Editor → New query → shu faylni to'liq
-- joylab "Run" bosing. Qayta ishga tushirish xavfsiz (idempotent).
-- =====================================================================

-- ---------- 1. JADVALLAR ----------

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  phone       text,
  role        text not null default 'student' check (role in ('student','mentor')),
  bio         text,
  created_at  timestamptz not null default now()
);

create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  mentor_id    uuid not null references public.profiles(id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  description  text not null default '',
  subject      text not null default '',
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.lessons (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 200),
  content    text not null default '',
  video_url  text,
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, course_id)
);

create table if not exists public.lesson_progress (
  student_id   uuid not null references public.profiles(id) on delete cascade,
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (student_id, lesson_id)
);

create table if not exists public.assignments (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  due_at      timestamptz,
  max_score   int  not null default 5 check (max_score between 1 and 100),
  created_at  timestamptz not null default now()
);

create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  content       text not null default '',
  score         int,
  feedback      text,
  submitted_at  timestamptz not null default now(),
  graded_at     timestamptz,
  unique (assignment_id, student_id)
);

create index if not exists courses_mentor_idx     on public.courses(mentor_id);
create index if not exists lessons_course_idx     on public.lessons(course_id, position);
create index if not exists enrollments_course_idx on public.enrollments(course_id);
create index if not exists assignments_course_idx on public.assignments(course_id);
create index if not exists submissions_assign_idx on public.submissions(assignment_id);

-- ---------- 2. YORDAMCHI FUNKSIYALAR (RLS uchun) ----------
-- security definer: RLS siyosatlari bir-birini rekursiv chaqirmasligi uchun.

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.owns_course(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.courses where id = cid and mentor_id = auth.uid())
$$;

create or replace function public.is_enrolled(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.enrollments where course_id = cid and student_id = auth.uid())
$$;

create or replace function public.assignment_course(aid uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select course_id from public.assignments where id = aid
$$;

create or replace function public.lesson_course(lid uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select course_id from public.lessons where id = lid
$$;

-- Mentor o'z kursiga yozilgan o'quvchini ko'ra oladimi?
create or replace function public.is_my_student(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.enrollments e join public.courses c on c.id = e.course_id
    where e.student_id = sid and c.mentor_id = auth.uid()
  )
$$;

-- ---------- 3. TRIGGERLAR ----------

-- Ro'yxatdan o'tganda profil avtomatik yaratiladi (rol metadata'dan olinadi).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r text := coalesce(new.raw_user_meta_data->>'role', 'student');
begin
  if r not in ('student','mentor') then r := 'student'; end if;
  insert into public.profiles (id, full_name, phone, role)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', ''),
          new.raw_user_meta_data->>'phone',
          r)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Foydalanuvchi o'z rolini keyin o'zgartira olmaydi.
create or replace function public.prevent_role_change() returns trigger
language plpgsql as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'Rolni o''zgartirib bo''lmaydi';
  end if;
  return new;
end $$;

drop trigger if exists profiles_lock_role on public.profiles;
create trigger profiles_lock_role
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- O'quvchi baho/izohni o'zi yoza olmaydi; mentor esa javob matnini o'zgartira olmaydi.
create or replace function public.guard_submission() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  is_owner boolean := public.owns_course(public.assignment_course(new.assignment_id));
  maxs int;
begin
  if tg_op = 'INSERT' then
    if not is_owner then
      new.score := null; new.feedback := null; new.graded_at := null;
    end if;
    return new;
  end if;

  if is_owner then
    new.content := old.content;
    new.student_id := old.student_id;
    new.assignment_id := old.assignment_id;
    new.submitted_at := old.submitted_at;
    if new.score is distinct from old.score or new.feedback is distinct from old.feedback then
      select max_score into maxs from public.assignments where id = new.assignment_id;
      if new.score is not null and (new.score < 0 or new.score > maxs) then
        raise exception 'Baho 0 dan % gacha bo''lishi kerak', maxs;
      end if;
      new.graded_at := case when new.score is null then null else now() end;
    end if;
  else
    new.score := old.score; new.feedback := old.feedback; new.graded_at := old.graded_at;
    new.student_id := old.student_id; new.assignment_id := old.assignment_id;
    new.submitted_at := now();
  end if;
  return new;
end $$;

drop trigger if exists submissions_guard on public.submissions;
create trigger submissions_guard
  before insert or update on public.submissions
  for each row execute function public.guard_submission();

-- ---------- 4. ROW LEVEL SECURITY ----------

alter table public.profiles        enable row level security;
alter table public.courses         enable row level security;
alter table public.lessons         enable row level security;
alter table public.enrollments     enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.assignments     enable row level security;
alter table public.submissions     enable row level security;

-- PROFILES
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or role = 'mentor' or public.is_my_student(id));

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- COURSES: hamma ko'radi (katalog), faqat mentor yaratadi, faqat egasi o'zgartiradi.
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select to authenticated
  using (is_published or mentor_id = auth.uid());

drop policy if exists courses_insert on public.courses;
create policy courses_insert on public.courses for insert to authenticated
  with check (mentor_id = auth.uid() and public.my_role() = 'mentor');

drop policy if exists courses_update on public.courses;
create policy courses_update on public.courses for update to authenticated
  using (mentor_id = auth.uid()) with check (mentor_id = auth.uid());

drop policy if exists courses_delete on public.courses;
create policy courses_delete on public.courses for delete to authenticated
  using (mentor_id = auth.uid());

-- LESSONS: kurs egasi boshqaradi, yozilgan o'quvchi ko'radi.
drop policy if exists lessons_select on public.lessons;
create policy lessons_select on public.lessons for select to authenticated
  using (public.owns_course(course_id) or public.is_enrolled(course_id));

drop policy if exists lessons_write on public.lessons;
create policy lessons_write on public.lessons for all to authenticated
  using (public.owns_course(course_id)) with check (public.owns_course(course_id));

-- ENROLLMENTS: faqat o'quvchi o'zini yozadi.
drop policy if exists enroll_select on public.enrollments;
create policy enroll_select on public.enrollments for select to authenticated
  using (student_id = auth.uid() or public.owns_course(course_id));

drop policy if exists enroll_insert on public.enrollments;
create policy enroll_insert on public.enrollments for insert to authenticated
  with check (student_id = auth.uid() and public.my_role() = 'student');

drop policy if exists enroll_delete on public.enrollments;
create policy enroll_delete on public.enrollments for delete to authenticated
  using (student_id = auth.uid() or public.owns_course(course_id));

-- LESSON PROGRESS
drop policy if exists progress_select on public.lesson_progress;
create policy progress_select on public.lesson_progress for select to authenticated
  using (student_id = auth.uid() or public.owns_course(public.lesson_course(lesson_id)));

drop policy if exists progress_insert on public.lesson_progress;
create policy progress_insert on public.lesson_progress for insert to authenticated
  with check (student_id = auth.uid() and public.is_enrolled(public.lesson_course(lesson_id)));

drop policy if exists progress_delete on public.lesson_progress;
create policy progress_delete on public.lesson_progress for delete to authenticated
  using (student_id = auth.uid());

-- ASSIGNMENTS
drop policy if exists assign_select on public.assignments;
create policy assign_select on public.assignments for select to authenticated
  using (public.owns_course(course_id) or public.is_enrolled(course_id));

drop policy if exists assign_write on public.assignments;
create policy assign_write on public.assignments for all to authenticated
  using (public.owns_course(course_id)) with check (public.owns_course(course_id));

-- SUBMISSIONS
drop policy if exists sub_select on public.submissions;
create policy sub_select on public.submissions for select to authenticated
  using (student_id = auth.uid() or public.owns_course(public.assignment_course(assignment_id)));

drop policy if exists sub_insert on public.submissions;
create policy sub_insert on public.submissions for insert to authenticated
  with check (student_id = auth.uid()
              and public.is_enrolled(public.assignment_course(assignment_id)));

-- O'quvchi baholanmagan javobini tahrirlay oladi; mentor baholaydi.
drop policy if exists sub_update on public.submissions;
create policy sub_update on public.submissions for update to authenticated
  using ((student_id = auth.uid() and score is null)
         or public.owns_course(public.assignment_course(assignment_id)))
  with check (student_id = auth.uid()
              or public.owns_course(public.assignment_course(assignment_id)));

-- ---------- 5. HUQUQLAR ----------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke all on all tables in schema public from anon;
grant execute on all functions in schema public to authenticated;
