'use client';
import Link from 'next/link';
import { useStudent } from '@/components/student/StudentProvider';
import { CourseRow, TaskRow, Empty } from '@/components/student/parts';

export default function StudentHome() {
  const { me, courses, lessonsOf, done, assignments, subs, pctOf } = useStudent();
  const next = courses.map((c) => ({ c, l: lessonsOf(c.id).find((l) => !done.has(l.id)) })).find((x) => x.l);
  const todo = assignments.filter((a) => !subs.has(a.id));
  const graded = [...subs.values()].filter((s) => s.score != null);
  const avg = graded.length ? (graded.reduce((t, s) => t + s.score, 0) / graded.length).toFixed(1) : '—';

  return (
    <div className="form" style={{ gap: 24 }}>
      <div>
        <h1>Salom, {me.full_name || 'o‘quvchi'}!</h1>
        <p className="muted">{todo.length ? `${todo.length} ta topshiriq sizni kutmoqda.` : 'Barcha topshiriqlar topshirilgan. Barakalla!'}</p>
      </div>

      {next && (
        <div className="hero">
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="k">Davom ettirish</span>
            <h2 style={{ fontSize: 22 }}>{next.c.title} · {next.l.title}</h2>
            <div className="bar"><div style={{ width: pctOf(next.c.id) + '%' }} /></div>
            <span className="small" style={{ color: '#B9C2D6' }}>Kursning {pctOf(next.c.id)}% qismi bajarildi</span>
          </div>
          <Link className="btn secondary" href={`/student/lessons/${next.l.id}`}>Darsni ochish</Link>
        </div>
      )}

      <div className="grid">
        <div className="stat"><span>Faol kurslar</span><b>{courses.length}</b></div>
        <div className="stat"><span>Tugatilgan darslar</span><b>{done.size}</b></div>
        <div className="stat"><span>O‘rtacha baho</span><b>{avg}</b></div>
        <div className="stat"><span>Kutilayotgan topshiriqlar</span><b>{todo.length}</b></div>
      </div>

      <div className="grid wide">
        <div className="card">
          <div className="row between"><h2>Kurslarim</h2><Link href="/student/courses" className="small">Barchasi</Link></div>
          <div className="list">
            {courses.slice(0, 4).map((c) => <CourseRow key={c.id} c={c} />)}
            {!courses.length && <Empty>Hali kursga yozilmagansiz. <Link href="/student/catalog">Katalogni ochish</Link></Empty>}
          </div>
        </div>
        <div className="card">
          <h2>Muddati yaqin topshiriqlar</h2>
          <div className="list">
            {todo.slice(0, 4).map((a) => <TaskRow key={a.id} a={a} />)}
            {!todo.length && <Empty>Topshiriq yo‘q</Empty>}
          </div>
        </div>
      </div>
    </div>
  );
}
