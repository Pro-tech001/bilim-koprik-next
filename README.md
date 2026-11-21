# Bilim Ko'prik — Next.js + Supabase

O'quvchi va mentor rollari ajratilgan onlayn ta'lim platformasi.
Next.js 16 (App Router) · React 19 · Supabase (Auth + Postgres + RLS).

## Talablar

- Node.js 20.9 yoki undan yangi (https://nodejs.org → LTS)

## 1. Bazani tayyorlash (bir marta)

Supabase Dashboard → **SQL Editor** → **New query** → `supabase/schema.sql` ni to'liq joylab **Run**.

## 2. Ishga tushirish

```
npm install
npm run dev
```

Brauzerda: http://localhost:3000

Supabase manzili va publishable kaliti `.env.local` faylida turibdi:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

> Bu faylga **hech qachon** `service_role` / secret kalitni yozmang.

## 3. Supabase Auth sozlamalari

- **Authentication → Sign In / Providers → Email → "Confirm email"**:
  sinov paytida o'chirib qo'ysangiz, ro'yxatdan o'tgan foydalanuvchi darhol panelga kiradi.
- **Authentication → URL Configuration**:
  - Site URL: `http://localhost:3000` (sayt chiqqach — haqiqiy manzil)
  - Redirect URLs ga qo'shing: `http://localhost:3000/auth/callback` va
    `https://SIZNING-SAYT.vercel.app/auth/callback`

## 4. Internetga chiqarish (Vercel, bepul)

1. Loyihani GitHub'ga yuklang.
2. https://vercel.com → **Add New → Project** → repo'ni tanlang.
3. **Environment Variables** ga `.env.local` dagi ikki qatorni qo'shing → **Deploy**.
4. Supabase'da Site URL va Redirect URL'ni Vercel manziliga yangilang.

## Tuzilma

```
proxy.js                     ← server himoyasi: /student → faqat o'quvchi, /mentor → faqat mentor
app/
  page.js                    ← kirish + ro'yxatdan o'tish (rol tanlash)
  reset/page.js              ← yangi parol
  auth/callback/route.js     ← email tasdiqlash / parol tiklash havolalari
  student/                   ← o'quvchi paneli
    page.js                    bosh sahifa
    courses/, courses/[id]/    kurslarim, kurs ichi
    catalog/                   kurslar katalogi (yozilish)
    lessons/[id]/              dars (matn + YouTube)
    tasks/, results/, profile/
  mentor/                    ← mentor paneli
    page.js                    bosh sahifa (tezkor amallar, statistika)
    students/                  o'quvchilar va o'zlashtirish
    courses/, courses/[id]/    kurs, dars, topshiriq boshqaruvi
    assignments/, grading/     topshiriqlar, baholash
    stats/, profile/
components/                  ← umumiy komponentlar (Sidebar, FormModal, Toast, ...)
  student/, mentor/          ← rol bo'yicha ma'lumot provayderi va formalar
lib/supabase/                ← brauzer va server Supabase klientlari
supabase/schema.sql          ← jadvallar, triggerlar, RLS siyosatlari
```

## Xavfsizlik (3 qavat)

1. **proxy.js** — sahifa ochilishidan oldin serverda rolni tekshiradi.
2. **Provider** — mijoz tomonida ham rol tekshiriladi.
3. **RLS (bazada)** — asosiy himoya: o'quvchi kurs yarata olmaydi, o'ziga baho qo'ya olmaydi,
   boshqalarning javoblarini ko'rmaydi, hech kim rolini o'zgartira olmaydi.
"# bilim-koprik-next" 
