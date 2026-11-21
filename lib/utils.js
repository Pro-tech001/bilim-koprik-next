export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export function dueLabel(d) {
  if (!d) return 'Muddatsiz';
  const days = Math.ceil((new Date(d) - Date.now()) / 86400000);
  if (days < 0) return 'Muddati o‘tgan';
  if (days === 0) return 'Bugun';
  if (days === 1) return 'Ertaga';
  return days + ' kun qoldi';
}

const ERRORS = {
  'Invalid login credentials': 'Email yoki parol noto‘g‘ri.',
  'User already registered': 'Bu email bilan allaqachon ro‘yxatdan o‘tilgan.',
  'Email not confirmed': 'Email hali tasdiqlanmagan. Pochtangizdagi havolani bosing.',
  'Password should be at least 6 characters.': 'Parol kamida 6 ta belgidan iborat bo‘lsin.'
};

export function errText(e) {
  const m = (e && (e.message || e.error_description)) || String(e);
  return ERRORS[m] || m;
}

// YouTube havolasini embed ko'rinishiga o'tkazish
export function toEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return 'https://www.youtube.com/embed/' + u.pathname.slice(1);
    if (u.hostname.includes('youtube.com')) {
      return 'https://www.youtube.com/embed/' + (u.searchParams.get('v') || u.pathname.split('/').pop());
    }
  } catch {}
  return null;
}

export function toLocalInput(d) {
  if (!d) return '';
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 16);
}

export const initial = (s) => (s || '?').trim().charAt(0).toUpperCase();
