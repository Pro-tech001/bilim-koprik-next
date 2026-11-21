'use client';
import { useMentor } from '@/components/mentor/MentorProvider';
import { PendingList } from '@/components/mentor/parts';

export default function Grading() {
  const { subs, asg, open } = useMentor();
  const graded = subs.filter((s) => s.score != null);
  return (
    <div className="form" style={{ gap: 20 }}>
      <h1>Baholash</h1>
      <div className="card">
        <h2>Kutilmoqda</h2>
        <div className="list"><PendingList /></div>
      </div>
      <div className="card">
        <h2>Baholangan</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>O‘quvchi</th><th>Topshiriq</th><th>Baho</th><th>Izoh</th><th /></tr></thead>
            <tbody>
              {graded.map((s) => (
                <tr key={s.id}>
                  <td>{s.student?.full_name}</td>
                  <td>{asg(s.assignment_id)?.title}</td>
                  <td><b>{s.score}</b>/{asg(s.assignment_id)?.max_score}</td>
                  <td>{s.feedback || '—'}</td>
                  <td><button className="btn sm secondary" onClick={() => open('grade', { submission: s })}>O‘zgartirish</button></td>
                </tr>
              ))}
              {!graded.length && <tr><td colSpan={5} className="muted">Hali yo‘q</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
