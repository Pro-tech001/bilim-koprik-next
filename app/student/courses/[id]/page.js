'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStudent } from '@/components/student/StudentProvider';
import { TaskRow, Empty } from '@/components/student/parts';
import { errText } from '@/lib/utils';
import { useT } from '@/lib/i18n';

export default function StudentCourse() {
  const { id } = useParams();
  const router = useRouter();
  const { sb, me, courseById, lessonsOf, pctOf, done, assignments, reload, toast } = useStudent();
  const c = courseById(id);
  const t = useT();

  if (!c) {
    return <Empty>{t('Kurs topilmadi yoki siz unga yozilmagansiz.')} <Link href="/student/catalog">{t('Katalog')}</Link></Empty>;
  }

  async function leave() {
    if (!confirm(t('Kursdan chiqmoqchimisiz?'))) return;
    const { error } = await sb.from('enrollments').delete().eq('student_id', me.id).eq('course_id', id);
    if (error) return toast(errText(error));
    await reload();
    router.push('/student/courses');
  }

  const ls = lessonsOf(id);
  const as = assignments.filter((a) => a.course_id === id);
  const pct = pctOf(id);

  return (
    <div className="form" style={{ gap: 20 }}>
      <Link href="/student/courses" className="small">← {t('Kurslarim')}</Link>
      <div className="row between">
        <div><h1>{c.title}</h1><p className="muted">{t('Mentor')}: {c.mentor?.full_name || '—'}</p></div>
        <button className="btn secondary sm" onClick={leave}>{t('Kursdan chiqish')}</button>
      </div>
      {c.description && <p className="muted">{c.description}</p>}

      <div className="card">
        <div className="row between"><h2>{t('Darslar')}</h2><span className="small muted">{t('{n}% bajarildi', { n: pct })}</span></div>
        <div className="bar"><div style={{ width: pct + '%' }} /></div>
        <div className="list">
          {ls.map((l, i) => (
            <Link key={l.id} className="item" href={`/student/lessons/${l.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="ico">{done.has(l.id) ? '✓' : i + 1}</div>
              <div className="grow"><span className="t">{l.title}</span></div>
              {done.has(l.id) && <span className="badge green">{t('Tugatilgan')}</span>}
            </Link>
          ))}
          {!ls.length && <Empty>{t('Mentor hali dars qo‘shmagan.')}</Empty>}
        </div>
      </div>

      <div className="card">
        <h2>{t('Topshiriqlar')}</h2>
        <div className="list">
          {as.map((a) => <TaskRow key={a.id} a={a} />)}
          {!as.length && <Empty>{t('Topshiriq yo‘q')}</Empty>}
        </div>
      </div>
    </div>
  );
}
