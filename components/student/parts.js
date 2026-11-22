'use client';
import Link from 'next/link';
import { dueLabel, fmtDate, initial } from '@/lib/utils';
import { useStudent } from './StudentProvider';
import { useT } from '@/lib/i18n';

export function CourseRow({ c }) {
  const { pctOf, lessonsOf } = useStudent();
  const p = pctOf(c.id);
  const t = useT();
  return (
    <Link className="item" href={`/student/courses/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="ico">{initial(c.title)}</div>
      <div className="grow">
        <div className="row between"><span className="t">{c.title}</span><span className="muted small">{p}%</span></div>
        <div className="bar"><div style={{ width: p + '%' }} /></div>
        <span className="small muted">{t('Mentor')}: {c.mentor?.full_name || '—'} · {t('{n} ta dars', { n: lessonsOf(c.id).length })}</span>
      </div>
    </Link>
  );
}

export function TaskRow({ a }) {
  const { subs, courseById, openSubmit } = useStudent();
  const s = subs.get(a.id);
  const t = useT();
  let badge = <span className="badge orange">{dueLabel(a.due_at)}</span>;
  if (s && s.score != null) badge = <span className="badge green">{t('Baho')}: {s.score}/{a.max_score}</span>;
  else if (s) badge = <span className="badge gray">{t('Tekshirilmoqda')}</span>;
  return (
    <div className="item">
      <div className="grow">
        <span className="t">{a.title}</span>
        <span className="small muted">{courseById(a.course_id)?.title} · {t('Muddat')}: {fmtDate(a.due_at)}</span>
      </div>
      {badge}
      <button className={'btn sm ' + (s ? 'secondary' : '')} data-act="submit" onClick={() => openSubmit(a)}>
        {s ? t('Ko‘rish') : t('Topshirish')}
      </button>
    </div>
  );
}

export const Empty = ({ children }) => <div className="empty">{children}</div>;
