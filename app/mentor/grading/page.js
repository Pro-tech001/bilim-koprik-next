'use client';
import { useMentor } from '@/components/mentor/MentorProvider';
import { PendingList } from '@/components/mentor/parts';
import { useT } from '@/lib/i18n';

export default function Grading() {
  const { subs, asg, open } = useMentor();
  const graded = subs.filter((s) => s.score != null);
  const t = useT();
  return (
    <div className="form" style={{ gap: 20 }}>
      <h1>{t('Baholash')}</h1>
      <div className="card">
        <h2>{t('Kutilmoqda')}</h2>
        <div className="list"><PendingList /></div>
      </div>
      <div className="card">
        <h2>{t('Baholangan')}</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>{t('O‘quvchi')}</th><th>{t('Topshiriq')}</th><th>{t('Baho')}</th><th>{t('Izoh')}</th><th /></tr></thead>
            <tbody>
              {graded.map((s) => (
                <tr key={s.id}>
                  <td>{s.student?.full_name}</td>
                  <td>{asg(s.assignment_id)?.title}</td>
                  <td><b>{s.score}</b>/{asg(s.assignment_id)?.max_score}</td>
                  <td>{s.feedback || '—'}</td>
                  <td><button className="btn sm secondary" onClick={() => open('grade', { submission: s })}>{t('O‘zgartirish')}</button></td>
                </tr>
              ))}
              {!graded.length && <tr><td colSpan={5} className="muted">{t('Hali yo‘q')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
