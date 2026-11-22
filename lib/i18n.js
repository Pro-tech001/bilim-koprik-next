'use client';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LANGS, normLang, tr, setCurrentLang } from './lang';

const Ctx = createContext({ lang: 'uz', setLang: () => {} });

const readCookie = () => normLang((document.cookie.match(/(?:^|; )lang=(\w+)/) || [])[1]);

export function I18nProvider({ children }) {
  // Server va birinchi chizish o'zbekcha; keyin brauzer cookie'sidagi til (ekran chizilishidan oldin).
  const [lang, setLangState] = useState('uz');
  setCurrentLang(lang);

  useLayoutEffect(() => {
    const l = readCookie();
    if (l !== 'uz') { setCurrentLang(l); setLangState(l); }
  }, []);

  useEffect(() => {
    const d = document.documentElement;
    d.lang = lang === 'oz' ? 'uz' : lang;
    d.classList.remove('i18n-wait');
  }, [lang]);

  const setLang = useCallback((v) => {
    const l = normLang(v);
    setCurrentLang(l);
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    setLangState(l);
  }, []);

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

// Komponent ichida: const t = useT(); t('Kirish')
export function useT() {
  const { lang } = useContext(Ctx);
  return useCallback((s, vars) => tr(s, vars, lang), [lang]);
}
export const useLang = () => useContext(Ctx);

// Kichkina til tugmasi: bosganda tillar ro'yxati ochiladi.
export function LangSwitch({ up = false }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cur = LANGS.find((l) => l.code === lang) || LANGS[0];

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div className={'lang' + (up ? ' up' : '')} ref={ref}>
      <button type="button" className="lang-btn" data-act="lang" aria-haspopup="listbox" aria-expanded={open}
        aria-label="Til / Language / Язык" onClick={() => setOpen((v) => !v)}>
        <span aria-hidden="true">🌐</span>{cur.short}<span aria-hidden="true" className="caret">▾</span>
      </button>
      {open && (
        <ul className="lang-menu" role="listbox" aria-label="Til / Language / Язык">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button type="button" role="option" aria-selected={l.code === lang} data-lang={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}>
                <b>{l.short}</b>{l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
