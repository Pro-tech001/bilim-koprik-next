import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Har so'rovda: sessiyani yangilaydi va rol bo'yicha sahifalarni himoya qiladi.
//   /student/*  → faqat o'quvchi
//   /mentor/*   → faqat mentor
//   /           → kirgan bo'lsa o'z paneliga yo'naltiriladi
export async function proxy(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const area = path.startsWith('/mentor') ? 'mentor' : path.startsWith('/student') ? 'student' : null;

  const redirect = (to) => {
    const res = NextResponse.redirect(new URL(to, request.url));
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!user) {
    return area ? redirect('/') : response;
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const home = profile?.role === 'mentor' ? '/mentor' : '/student';

  if (path === '/') return redirect(home);
  if (area && profile && area !== profile.role) return redirect(home);
  return response;
}

export const config = {
  matcher: ['/', '/student/:path*', '/mentor/:path*']
};
