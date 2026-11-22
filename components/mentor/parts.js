'use client';
import { fmtDate } from '@/lib/utils';
import { errText } from '@/lib/utils';
import { useMentor } from './MentorProvider';
import { useT } from '@/lib/i18n';

export const Empty = ({ children }) => <div className="empty">{children}</div>;

export function StudentsTable({ rows }) {
  const { course, lessonsOf, progressPct, avgScore } = useMentor();
  const t = useT();
  if (!rows.length) return <Empty>{t('Hali o‘quvchi yo‘q. Kurs yaratganingizdan so‘ng o‘quvchilar katalogdan yozilishadi.')}</Empty>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>{t('O‘quvchi')}</th><th>{t('Telefon')}</th><th>{t('Kurs')}</th><th>{t('O‘zlashtirish')}</th><th>{t('O‘rtacha baho (5)')}</th><th>{t('Holat')}</th></tr>
        </thead>
        <tbody>
          {rows.map((e) => {
            const p = progressPct(e.student_id, e.course_id);
            const ok = p >= 50 || !lessonsOf(e.course_id).length;
            return (
              <tr key={e.student_id + e.course_id}>
                <td><b>{e.student?.full_name || '—'}</b></td>
                <td>{e.student?.phone || '—'}</td>
                <td>{course(e.course_id)?.title}</td>
                <td>
                  <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
                    <div className="bar" style={{ width: 100 }}><div style={{ width: p + '%' }} /></div>
                    <span className="muted">{p}%</span>
                  </div>
                </td>
                <td>{avgScore(e.student_id, e.course_id)}</td>
                <td><span className={'badge ' + (ok ? 'green' : 'orange')}>{ok ? t('Faol') : t('E‘tibor kerak')}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PendingList({ limit }) {
  const { subs, asg, open } = useMentor();
  const t = useT();
  const list = subs.filter((s) => s.score == null).slice(0, limit || 999);
  if (!list.length) return <Empty>{t('Baholashni kutayotgan javob yo‘q')}</Empty>;
  return list.map((s) => (
    <div className="item" key={s.id}>
      <div className="grow">
        <span className="t">{s.student?.full_name || '—'}</span>
        <span className="small muted">{asg(s.assignment_id)?.title} · {fmtDate(s.submitted_at)}</span>
      </div>
      <button className="btn sm" data-act="grade" onClick={() => open('grade', { submission: s })}>{t('Baholash')}</button>
    </div>
  ));
}

export function AsgRow({ a }) {
  const { subs, course, open, sb, reload, toast } = useMentor();
  const list = subs.filter((s) => s.assignment_id === a.id);
  const pend = list.filter((s) => s.score == null).length;
  const t = useT();

  async function remove() {
    if (!confirm(t('Topshiriq va unga kelgan javoblar o‘chiriladi. Davom etasizmi?'))) return;
    const { error } = await sb.from('assignments').delete().eq('id', a.id);
    if (error) return toast(errText(error));
    await reload();
    toast('Topshiriq o‘chirildi');
  }

  return (
    <div className="item">
      <div className="grow">
        <span className="t">{a.title}</span>
        <span className="small muted">{course(a.course_id)?.title} · {t('Muddat')}: {fmtDate(a.due_at)} · {t('Maks. {n} ball', { n: a.max_score })}</span>
      </div>
      <span className={'badge ' + (pend ? 'orange' : 'gray')}>{t('{n} javob', { n: list.length })}{pend ? ', ' + t('{n} kutmoqda', { n: pend }) : ''}</span>
      <button className="btn sm secondary" onClick={() => open('assignment', { assignment: a })}>{t('Tahrirlash')}</button>
      <button className="btn sm danger" onClick={remove}>{t('O‘chirish')}</button>
    </div>
  );
}
