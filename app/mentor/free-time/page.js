'use client';
import { useState } from 'react';
import { useMentor } from '@/components/mentor/MentorProvider';
import { Empty } from '@/components/mentor/parts';
import { fmtDate } from '@/lib/utils';
import { useT } from '@/lib/i18n';

const TABS = { new: 'Yangi', mine: 'Men javob berganlar', other: 'Boshqa mentorlar' };

export default function FreeTime() {
  const { apps, me, open } = useMentor();
  const [tab, setTab] = useState('new');
  const t = useT();

  if (apps === null) {
    return (
      <div className="form" style={{ gap: 20 }}>
        <h1>{t('Bo‘sh vaqt (arizalar)')}</h1>
        <div className="msg err">{t('Bu bo‘lim uchun bazada jadval yo‘q. Supabase SQL Editor’da {f} faylini bir marta ishga tushiring.', { f: 'supabase/arizalar.sql' })}</div>
      </div>
    );
  }

  const groups = {
    new: apps.filter((a) => a.status === 'new'),
    mine: apps.filter((a) => a.status !== 'new' && a.mentor_id === me.id),
    other: apps.filter((a) => a.status !== 'new' && a.mentor_id !== me.id)
  };

  return (
    <div className="form" style={{ gap: 20 }}>
      <div>
        <h1>{t('Bo‘sh vaqt (arizalar)')}</h1>
        <p className="muted">{t('O‘quvchilar qaysi fanni o‘rganmoqchi ekani va qachon bo‘sh ekanini yozadi. Xohlasangiz qabul qiling va qachon dars o‘tib bera olishingizni yozing — bu majburiy emas.')}</p>
      </div>
      <div className="tabs" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))', maxWidth: 640 }}>
        {Object.keys(TABS).map((k) => (
          <button key={k} type="button" aria-pressed={k === tab} onClick={() => setTab(k)}>
            {t(TABS[k])} ({groups[k].length})
          </button>
        ))}
      </div>
      <div className="grid wide">
        {groups[tab].map((a) => (
          <div className="card app-card" key={a.id} data-app={a.subject}>
            <div className="row between">
              <div>
                <h3>{a.student?.full_name || t('O‘quvchi')}</h3>
                <span className="small muted">{a.student?.phone || t('Telefon ko‘rsatilmagan')} · {fmtDate(a.created_at)}</span>
              </div>
              <StatusBadge a={a} t={t} />
            </div>
            <dl className="app-info">
              <dt>{t('Fan')}</dt><dd>{a.subject}</dd>
              <dt>{t('Nimani o‘rganmoqchi')}</dt><dd>{a.goal || '—'}</dd>
              <dt>{t('Bo‘sh vaqti')}</dt><dd>{a.free_time || '—'}</dd>
              {a.status !== 'new' && (
                <>
                  <dt>{t('Javob')}</dt>
                  <dd>{a.reply || <span className="muted">{t('Javob yozilmagan')}</span>}{a.mentor_id !== me.id && a.mentor?.full_name ? ` — ${a.mentor.full_name}` : ''}</dd>
                </>
              )}
            </dl>
            {a.status === 'new' && (
              <div className="row">
                <button className="btn sm" data-act="accept" onClick={() => open('reply', { app: a, status: 'accepted' })}>{t('Qabul qilish')}</button>
                <button className="btn sm secondary" data-act="decline" onClick={() => open('reply', { app: a, status: 'declined' })}>{t('Rad etish')}</button>
              </div>
            )}
            {a.status !== 'new' && a.mentor_id === me.id && (
              <div className="row">
                <button className="btn sm secondary" onClick={() => open('reply', { app: a, status: a.status })}>{t('Javobni o‘zgartirish')}</button>
              </div>
            )}
          </div>
        ))}
        {!groups[tab].length && <Empty>{tab === 'new' ? t('Hozircha yangi ariza yo‘q.') : t('Bu bo‘limda ariza yo‘q.')}</Empty>}
      </div>
    </div>
  );
}

function StatusBadge({ a, t }) {
  if (a.status === 'accepted') return <span className="badge green">{t('Qabul qilindi')}</span>;
  if (a.status === 'declined') return <span className="badge gray">{t('Rad etildi')}</span>;
  return <span className="badge orange">{t('Yangi')}</span>;
}
