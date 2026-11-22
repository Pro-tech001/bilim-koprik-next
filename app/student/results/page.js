'use client';
import { useStudent } from '@/components/student/StudentProvider';
import { Empty } from '@/components/student/parts';
import { fmtDate } from '@/lib/utils';
import { useT } from '@/lib/i18n';

export default function Results() {
  const { assignments, subs, courses, courseById, pctOf } = useStudent();
  const rows = assignments.filter((a) => subs.get(a.id)?.score != null);
  const t = useT();

  return (
    <div className="form" style={{ gap: 20 }}>
      <h1>{t('Natijalarim')}</h1>
      <div className="grid">
        {courses.map((c) => {
          const g = rows.filter((a) => a.course_id === c.id).map((a) => (subs.get(a.id).score / a.max_score) * 100);
          return (
            <div className="stat" key={c.id}>
              <span>{c.title}</span>
              <b>{g.length ? Math.round(g.reduce((x, y) => x + y, 0) / g.length) + '%' : '—'}</b>
              <span>{t('{n}% darslar tugatilgan', { n: pctOf(c.id) })}</span>
            </div>
          );
        })}
        {!courses.length && <Empty>{t('Natija yo‘q')}</Empty>}
      </div>
      <div className="card">
        <h2>{t('Baholar')}</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>{t('Topshiriq')}</th><th>{t('Kurs')}</th><th>{t('Baho')}</th><th>{t('Mentor izohi')}</th><th>{t('Sana')}</th></tr></thead>
            <tbody>
              {rows.map((a) => {
                const s = subs.get(a.id);
                return (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{courseById(a.course_id)?.title}</td>
                    <td><b>{s.score}</b>/{a.max_score}</td>
                    <td>{s.feedback || '—'}</td>
                    <td>{fmtDate(s.graded_at)}</td>
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={5} className="muted">{t('Hali baholangan topshiriq yo‘q')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
