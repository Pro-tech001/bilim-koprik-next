import { DICT } from './dict';

// Tillar: uz = o'zbek (lotin), oz = o'zbek (yangi alifbo), ru = rus, en = ingliz.
export const LANGS = [
  { code: 'uz', label: 'O‘zbekcha', short: 'UZ' },
  { code: 'oz', label: 'Ózbekça (yangi alifbo)', short: 'ÓZ' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'en', label: 'English', short: 'EN' }
];
export const LOCALES = { uz: 'uz-UZ', oz: 'uz-UZ', ru: 'ru-RU', en: 'en-GB' };
const CODES = LANGS.map((l) => l.code);
export const normLang = (v) => (CODES.includes(v) ? v : 'uz');

let current = 'uz';
export const currentLang = () => current;
export const setCurrentLang = (l) => { current = l; };

// Joriy lotin yozuvini yangi alifboga o'tkazish: o‘→ó, g‘→ǵ, sh→ş, ch→ç.
export function toNewAlphabet(s) {
  return s
    .replace(/O[‘’'ʻ`]/g, 'Ó').replace(/o[‘’'ʻ`]/g, 'ó')
    .replace(/G[‘’'ʻ`]/g, 'Ǵ').replace(/g[‘’'ʻ`]/g, 'ǵ')
    .replace(/SH/g, 'Ş').replace(/Sh/g, 'Ş').replace(/sh/g, 'ş')
    .replace(/CH/g, 'Ç').replace(/Ch/g, 'Ç').replace(/ch/g, 'ç');
}

// Matnni joriy tilga o'girish. Kalit — o'zbekcha (lotin) matn; {x} — o'zgaruvchilar.
export function tr(s, vars, lang = current) {
  if (s == null) return '';
  let out = String(s);
  if (lang === 'ru' || lang === 'en') out = DICT[lang][out] ?? out;
  if (lang === 'oz') out = toNewAlphabet(out); // o'zgaruvchilardan oldin: email/nomlar buzilmasin
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return out;
}

