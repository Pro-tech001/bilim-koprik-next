'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/components/student/StudentProvider';
import { Empty } from '@/components/student/parts';
import { errText, initial } from '@/lib/utils';
import { useT } from '@/lib/i18n';

export default function Catalog() {
  const { sb, me, courses, reload, toast } = useStudent();
  const router = useRouter();
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const t = useT();
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    sb.from('courses')
      .select('id,title,description,subject, mentor:profiles!mentor_id(full_name)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => (error ? setErr(errText(error)) : setList(data)));
  }, [sb]);

  async function enroll(id) {
    setBusy(id);
    const { error } = await sb.from('enrollments').insert({ student_id: me.id, course_id: id });
    if (error) { setBusy(null); return toast(errText(error)); }
    await reload();
    toast('Kursga yozildingiz!');
    router.push(`/student/courses/${id}`);
  }

  const mine = new Set(courses.map((c) => c.id));

  return (
    <div className="form" style={{ gap: 20 }}>
      <h1>{t('Kurslar katalogi')}</h1>
      {err && <div className="msg err">{err}</div>}
      {!list && !err && <p className="muted">{t('Yuklanmoqda...')}</p>}
      {list && (
        <div className="grid wide">
          {list.map((c) => (
            <div className="card" key={c.id}>
              <div className="row">
                <div className="ico">{initial(c.title)}</div>
                <div>
                  <h3>{c.title}</h3>
                  <span className="small muted">{c.subject || t('Fan ko‘rsatilmagan')} · {c.mentor?.full_name}</span>
                </div>
              </div>
              <p className="muted small">{c.description || t('Tavsif yo‘q')}</p>
              {mine.has(c.id) ? (
                <Link className="btn secondary" href={`/student/courses/${c.id}`}>{t('Kursni ochish')}</Link>
              ) : (
                <button className="btn" data-act="enroll" disabled={busy === c.id} onClick={() => enroll(c.id)}>{t('Kursga yozilish')}</button>
              )}
            </div>
          ))}
          {!list.length && <Empty>{t('Hozircha kurslar yo‘q. Mentorlar kurs qo‘shgach shu yerda ko‘rinadi.')}</Empty>}
        </div>
      )}
    </div>
  );
}
