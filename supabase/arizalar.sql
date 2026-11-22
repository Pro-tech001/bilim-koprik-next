-- =====================================================================
-- Bilim Ko'prik — KURS UCHUN ARIZA (o'quvchi -> mentorlar)
-- O'quvchi qiziqishi, maqsadi va bo'sh vaqtini yozadi; barcha mentorlar ko'radi.
-- Mentor xohlasa qabul qiladi/rad etadi va (ixtiyoriy) javob yozadi.
-- Supabase SQL Editor'da bir marta Run qiling. Qayta ishga tushirish xavfsiz.
-- =====================================================================

create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  subject     text not null check (char_length(subject) between 1 and 120),
  goal        text not null default '' check (char_length(goal) <= 2000),
  free_time   text not null default '' check (char_length(free_time) <= 1000),
  status      text not null default 'new' check (status in ('new','accepted','declined')),
  mentor_id   uuid references public.profiles(id) on delete set null,
  reply       text check (char_length(reply) <= 2000),
  replied_at  timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists applications_student_idx on public.applications(student_id);

-- Mentor ariza bergan o'quvchining ismi va telefonini ko'ra olishi uchun.
create or replace function public.is_applicant(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.my_role() = 'mentor'
     and exists (select 1 from public.applications where student_id = sid)
$$;

-- Kim nimani o'zgartira olishini qat'iy belgilaymiz.
create or replace function public.guard_application() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r text := public.my_role();
begin
  if auth.uid() is null then return new; end if;  -- SQL Editor (admin)

  if tg_op = 'INSERT' then
    if r is distinct from 'student' then raise exception 'Arizani faqat o''quvchi yubora oladi'; end if;
    new.student_id := auth.uid();
    new.status := 'new'; new.mentor_id := null; new.reply := null; new.replied_at := null;
    new.created_at := now();
    return new;
  end if;

  if old.student_id = auth.uid() then
    -- o'quvchi: faqat ko'rib chiqilmagan arizaning matnini o'zgartiradi
    if old.status <> 'new' then raise exception 'Ariza ko''rib chiqilgan, uni o''zgartirib bo''lmaydi'; end if;
    new.status := old.status; new.mentor_id := old.mentor_id; new.reply := old.reply;
    new.replied_at := old.replied_at; new.student_id := old.student_id; new.created_at := old.created_at;
    return new;
  end if;

  if r = 'mentor' then
    if old.mentor_id is not null and old.mentor_id <> auth.uid() then
      raise exception 'Bu arizaga boshqa mentor javob bergan';
    end if;
    -- mentor o'quvchi yozgan matnni o'zgartira olmaydi
    new.student_id := old.student_id; new.subject := old.subject; new.goal := old.goal;
    new.free_time := old.free_time; new.created_at := old.created_at;
    if new.status = 'new' then
      new.mentor_id := null; new.reply := null; new.replied_at := null;
    else
      new.mentor_id := auth.uid(); new.replied_at := now();
      new.reply := nullif(btrim(coalesce(new.reply, '')), '');
    end if;
    return new;
  end if;

  raise exception 'Ruxsat yo''q';
end $$;

drop trigger if exists applications_guard on public.applications;
create trigger applications_guard
  before insert or update on public.applications
  for each row execute function public.guard_application();

alter table public.applications enable row level security;

drop policy if exists app_select on public.applications;
create policy app_select on public.applications for select to authenticated
  using (student_id = auth.uid() or public.my_role() = 'mentor');

drop policy if exists app_insert on public.applications;
create policy app_insert on public.applications for insert to authenticated
  with check (student_id = auth.uid() and public.my_role() = 'student');

drop policy if exists app_update on public.applications;
create policy app_update on public.applications for update to authenticated
  using ((student_id = auth.uid() and status = 'new')
         or (public.my_role() = 'mentor' and (mentor_id is null or mentor_id = auth.uid())))
  with check (student_id = auth.uid() or public.my_role() = 'mentor');

drop policy if exists app_delete on public.applications;
create policy app_delete on public.applications for delete to authenticated
  using (student_id = auth.uid());

-- Profillar: mentor endi ariza bergan o'quvchilarni ham ko'radi.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or role = 'mentor' or public.is_my_student(id) or public.is_applicant(id));

grant select, insert, update, delete on public.applications to authenticated;
revoke all on public.applications from anon;
grant execute on function public.is_applicant(uuid) to authenticated;
