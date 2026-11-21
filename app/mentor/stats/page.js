'use client';
import { useMentor } from '@/components/mentor/MentorProvider';

export default function Stats() {
  const { courses, studentsOf, lessonsOf, progressPct, subs, asg } = useMentor();
  return (
    <div className="form" style={{ gap: 20 }}>
      <h1>Statistika</h1>
      <div className="card">
        <h2>Kurslar bo‘yicha</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Kurs</th><th>O‘quvchilar</th><th>Darslar</th><th>O‘rtacha o‘zlashtirish</th><th>Topshirilgan javoblar</th></tr>
            </thead>
            <tbody>
              {courses.map((c) => {
                const st = studentsOf(c.id);
                const avg = st.length ? Math.round(st.reduce((t, e) => t + progressPct(e.student_id, c.id), 0) / st.length) : 0;
                const n = subs.filter((s) => asg(s.assignment_id)?.course_id === c.id).length;
                return (
                  <tr key={c.id}>
                    <td><b>{c.title}</b></td>
                    <td>{st.length}</td>
                    <td>{lessonsOf(c.id).length}</td>
                    <td>
                      <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
                        <div className="bar" style={{ width: 140 }}><div style={{ width: avg + '%' }} /></div>{avg}%
                      </div>
                    </td>
                    <td>{n}</td>
                  </tr>
                );
              })}
              {!courses.length && <tr><td colSpan={5} className="muted">Kurs yo‘q</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
