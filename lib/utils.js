import { tr, currentLang, LOCALES } from './lang';

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString(LOCALES[currentLang()] || 'uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export function dueLabel(d) {
  if (!d) return tr('Muddatsiz');
  const days = Math.ceil((new Date(d) - Date.now()) / 86400000);
  if (days < 0) return tr('Muddati o‘tgan');
  if (days === 0) return tr('Bugun');
  if (days === 1) return tr('Ertaga');
  return tr('{n} kun qoldi', { n: days });
}

const ERRORS = {
  'Invalid login credentials': 'Email yoki parol noto‘g‘ri.',
  'User already registered': 'Bu email bilan allaqachon ro‘yxatdan o‘tilgan.',
  'Email not confirmed': 'Email hali tasdiqlanmagan. Pochtangizdagi havolani bosing.',
  'Password should be at least 6 characters.': 'Parol kamida 6 ta belgidan iborat bo‘lsin.',
  'email rate limit exceeded': 'Xat yuborish limiti tugadi (Supabase bepul tarifi: soatiga 2 ta). Birozdan keyin urinib ko‘ring.'
};

export function errText(e) {
  const m = (e && (e.message || e.error_description)) || String(e);
  return tr(ERRORS[m] || m);
}

// Mentor kiritgan havolani tartibga solish: "@kanal", "t.me/kanal", "youtu.be/..." -> to'liq https havola.
export function normalizeLink(raw) {
  let v = String(raw || '').trim();
  if (!v) return null;
  const tg = v.match(/^(?:https?:\/\/)?(?:www\.)?(?:t|telegram)\s*[./:]\s*me\s*[/:]+\s*@?(.+)$/i);
  if (tg) v = 'https://t.me/' + tg[1].replace(/\s+/g, '');
  else if (/^@[A-Za-z0-9_]{4,}$/.test(v)) v = 'https://t.me/' + v.slice(1);
  else if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
  try {
    const u = new URL(v);
    if (!u.hostname.includes('.')) throw 0;
    return u.toString();
  } catch {
    throw new Error(tr('Havola noto‘g‘ri. Misol: {a} yoki {b}', { a: 'https://youtu.be/abc', b: 'https://t.me/kanal/12' }));
  }
}

// Dars havolasi turini aniqlash: YouTube va ochiq Telegram post sahifa ichida ko'rsatiladi.
export function linkInfo(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, '');
    if (h === 'youtu.be') return { kind: 'youtube', embed: 'https://www.youtube.com/embed/' + u.pathname.slice(1) };
    if (h.endsWith('youtube.com')) {
      const vid = u.searchParams.get('v') || u.pathname.split('/').pop();
      return { kind: 'youtube', embed: 'https://www.youtube.com/embed/' + vid };
    }
    if (h === 't.me' || h === 'telegram.me') {
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 's') parts.shift();
      // ochiq kanal posti: t.me/kanal/123 (yopiq t.me/c/... joylab bo'lmaydi)
      if (parts.length >= 2 && parts[0] !== 'c' && /^\d+$/.test(parts[1])) {
        return { kind: 'telegram-post', url, embed: `https://t.me/${parts[0]}/${parts[1]}?embed=1` };
      }
      return { kind: 'telegram', url };
    }
    return { kind: 'link', url };
  } catch {
    return null;
  }
}

export function toLocalInput(d) {
  if (!d) return '';
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 16);
}

export const initial = (s) => (s || '?').trim().charAt(0).toUpperCase();
