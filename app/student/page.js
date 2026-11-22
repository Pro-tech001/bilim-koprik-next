'use client';
import Link from 'next/link';
import { useStudent } from '@/components/student/StudentProvider';
import { CourseRow, TaskRow, Empty } from '@/components/student/parts';
import { useT } from '@/lib/i18n';

export default function StudentHome() {
  const { me, courses, lessonsOf, done, assignments, subs, pctOf } = useStudent();
  const t = useT();
  const next = courses.map((c) => ({ c, l: lessonsOf(c.id).find((l) => !done.has(l.id)) })).find((x) => x.l);
  const todo = assignments.filter((a) => !subs.has(a.id));
  const graded = [...subs.values()].filter((s) => s.score != null);
  const avg = graded.length ? (graded.reduce((sum, s) => sum + s.score, 0) / graded.length).toFixed(1) : '—';

  return (
    <div className="form" style={{ gap: 24 }}>
      <div>
        <h1>{t('Salom, {name}!', { name: me.full_name || t('o‘quvchi') })}</h1>
        <p className="muted">{todo.length ? t('{n} ta topshiriq sizni kutmoqda.', { n: todo.length }) : t('Barcha topshiriqlar topshirilgan. Barakalla!')}</p>
      </div>

      {next && (
        <div className="hero">
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="k">{t('Davom ettirish')}</span>
            <h2 style={{ fontSize: 22 }}>{next.c.title} · {next.l.title}</h2>
            <div className="bar"><div style={{ width: pctOf(next.c.id) + '%' }} /></div>
            <span className="small" style={{ color: '#B9C2D6' }}>{t('Kursning {n}% qismi bajarildi', { n: pctOf(next.c.id) })}</span>
          </div>
          <Link className="btn secondary" href={`/student/lessons/${next.l.id}`}>{t('Darsni ochish')}</Link>
        </div>
      )}

      <div className="grid">
        <div className="stat"><span>{t('Faol kurslar')}</span><b>{courses.length}</b></div>
        <div className="stat"><span>{t('Tugatilgan darslar')}</span><b>{done.size}</b></div>
        <div className="stat"><span>{t('O‘rtacha baho')}</span><b>{avg}</b></div>
        <div className="stat"><span>{t('Kutilayotgan topshiriqlar')}</span><b>{todo.length}</b></div>
      </div>

      <div className="grid wide">
        <div className="card">
          <div className="row between"><h2>{t('Kurslarim')}</h2><Link href="/student/courses" className="small">{t('Barchasi')}</Link></div>
          <div className="list">
            {courses.slice(0, 4).map((c) => <CourseRow key={c.id} c={c} />)}
            {!courses.length && <Empty>{t('Hali kursga yozilmagansiz.')} <Link href="/student/catalog">{t('Katalogni ochish')}</Link></Empty>}
          </div>
        </div>
        <div className="card">
          <h2>{t('Muddati yaqin topshiriqlar')}</h2>
          <div className="list">
            {todo.slice(0, 4).map((a) => <TaskRow key={a.id} a={a} />)}
            {!todo.length && <Empty>{t('Topshiriq yo‘q')}</Empty>}
          </div>
        </div>
      </div>
    </div>
  );
}
