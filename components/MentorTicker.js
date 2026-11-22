'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { useT } from '@/lib/i18n';

// Harakatlanuvchi lenta uchun ro'yxatni to'ldiramiz: qisqa bo'lsa takrorlanadi.
const fill = (arr, min = 8) => { if (!arr.length) return arr; const out = []; while (out.length < min) out.push(...arr); return out; };

function Lane({ label, items, cert, speed }) {
  const list = fill(items);
  const dur = Math.max(18, list.length * speed) + 's';
  const row = (aria) => list.map((m, i) => (
    <li key={aria + i} aria-hidden={aria === 'b' ? 'true' : undefined}>
      <span className="tk-name">{m.full_name}</span>
      {cert && m.certificate && <span className="tk-cert">🎓 {m.certificate}</span>}
    </li>
  ));
  return (
    <div className={'tk-lane' + (cert ? ' cert' : '')}>
      <span className="tk-label">{label}</span>
      <div className="tk-viewport">
        <ul className="tk-track" style={{ animationDuration: dur }}>{row('a')}{row('b')}</ul>
      </div>
    </div>
  );
}

// Kirish sahifasidagi "Bizga ishonch bildirgan mentorlar" lentasi.
export default function MentorTicker() {
  const t = useT();
  const [list, setList] = useState([]);
  useEffect(() => {
    getSupabase().rpc('public_mentors').then(({ data, error }) => { if (!error && Array.isArray(data)) setList(data); });
  }, []);
  if (!list.length) return null; // jadval/funksiya hali yo'q yoki mentor yo'q — lenta chiqmaydi
  const certified = list.filter((m) => m.certificate);
  return (
    <section className="ticker-band" aria-label={t('Bizga ishonch bildirgan mentorlar')} id="mentor-ticker">
      {certified.length > 0 && <Lane label={t('Sertifikatli mentorlar')} items={certified} cert speed={4.5} />}
      <Lane label={t('Bizga ishonch bildirgan mentorlar')} items={list} speed={3} />
    </section>
  );
}
