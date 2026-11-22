-- =====================================================================
-- Bilim Ko'prik — KIRISH SAHIFASIDAGI MENTORLAR LENTASI
-- Mentor profilida sertifikatini yozadi va lentada ko'rinish-ko'rinmasligini tanlaydi.
-- Kirmagan mehmonlar faqat ism va sertifikatni ko'radi (telefon, email ko'rinmaydi).
-- Supabase SQL Editor'da bir marta Run qiling. Qayta ishga tushirish xavfsiz.
-- =====================================================================

alter table public.profiles add column if not exists certificate text;
alter table public.profiles add column if not exists show_in_ticker boolean not null default true;

do $$ begin
  alter table public.profiles add constraint profiles_certificate_len check (char_length(certificate) <= 120);
exception when duplicate_object then null; end $$;

-- Lenta uchun: faqat ism va sertifikat, faqat rozi bo'lgan mentorlar.
create or replace function public.public_mentors()
returns table (full_name text, certificate text)
language sql stable security definer set search_path = public as $$
  select p.full_name, nullif(btrim(p.certificate), '')
  from public.profiles p
  where p.role = 'mentor' and p.show_in_ticker and btrim(p.full_name) <> ''
  order by (nullif(btrim(p.certificate), '') is not null) desc, p.created_at
  limit 60
$$;

revoke all on function public.public_mentors() from public;
grant execute on function public.public_mentors() to anon, authenticated;
