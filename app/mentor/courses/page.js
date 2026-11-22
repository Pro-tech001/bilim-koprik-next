'use client';
import Link from 'next/link';
import { useMentor } from '@/components/mentor/MentorProvider';
import { Empty } from '@/components/mentor/parts';
import { errText } from '@/lib/utils';
import { useT } from '@/lib/i18n';

export default function MentorCourses() {
  const { courses, lessonsOf, studentsOf, assignments, open, sb, reload, toast } = useMentor();
  const t = useT();

  async function removeCourse(c) {
    if (!confirm(t('"{title}" kursi, uning darslari, topshiriqlari va javoblari o‘chiriladi. Davom etasizmi?', { title: c.title }))) return;
    const { error } = await sb.from('courses').delete().eq('id', c.id);
    if (error) return toast(errText(error));
    await reload();
    toast('Kurs o‘chirildi');
  }
  return (
    <div className="form" style={{ gap: 20 }}>
      <div className="row between">
        <h1>{t('Kurslarim')}</h1>
        <button className="btn" onClick={() => open('course')}>+ {t('Yangi kurs')}</button>
      </div>
      <div className="grid wide">
        {courses.map((c) => (
          <div className="card" key={c.id}>
            <div className="row between">
              <h3>{c.title}</h3>
              <span className={'badge ' + (c.is_published ? 'green' : 'gray')}>{c.is_published ? t('Nashr qilingan') : t('Qoralama')}</span>
            </div>
            {c.subject && <p className="small muted">{c.subject}</p>}
            <p className="small muted">
              {t('{n} ta dars', { n: lessonsOf(c.id).length })} · {t('{n} ta o‘quvchi', { n: studentsOf(c.id).length })} · {t('{n} ta topshiriq', { n: assignments.filter((a) => a.course_id === c.id).length })}
            </p>
            <div className="row">
              <Link className="btn sm" href={`/mentor/courses/${c.id}`}>{t('Boshqarish')}</Link>
              <button className="btn sm secondary" onClick={() => open('course', { course: c })}>{t('Tahrirlash')}</button>
              <button className="btn sm danger" data-act="delCourse" onClick={() => removeCourse(c)}>{t('O‘chirish')}</button>
            </div>
          </div>
        ))}
        {!courses.length && <Empty>{t('Hali kurs yo‘q. "+ Yangi kurs" tugmasini bosing.')}</Empty>}
      </div>
    </div>
  );
}
