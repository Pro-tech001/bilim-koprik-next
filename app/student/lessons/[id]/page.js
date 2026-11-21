'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStudent } from '@/components/student/StudentProvider';
import { Empty } from '@/components/student/parts';
import { errText, toEmbed } from '@/lib/utils';

export default function LessonPage() {
  const { id } = useParams();
  const { sb, me, lessonsOf, courseById, done, reload, toast } = useStudent();
  const [l, setL] = useState(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setL(undefined);
    sb.from('lessons').select('*').eq('id', id).single().then(({ data }) => setL(data || null));
  }, [sb, id]);

  if (l === undefined) return <p className="muted">Yuklanmoqda...</p>;
  if (!l) return <Empty>Dars topilmadi.</Empty>;

  const ls = lessonsOf(l.course_id);
  const i = ls.findIndex((x) => x.id === id);
  const prev = ls[i - 1];
  const next = ls[i + 1];
  const embed = toEmbed(l.video_url);
  const isDone = done.has(id);

  async function toggleDone() {
    setBusy(true);
    const { error } = isDone
      ? await sb.from('lesson_progress').delete().eq('student_id', me.id).eq('lesson_id', id)
      : await sb.from('lesson_progress').insert({ student_id: me.id, lesson_id: id });
    if (error) toast(errText(error));
    await reload();
    setBusy(false);
  }

  return (
    <div className="form" style={{ gap: 20 }}>
      <Link href={`/student/courses/${l.course_id}`} className="small">← {courseById(l.course_id)?.title || 'Kurs'}</Link>
      <h1>{l.title}</h1>
      {embed ? (
        <div className="video"><iframe src={embed} title={l.title} allowFullScreen /></div>
      ) : l.video_url ? (
        <a className="btn secondary" href={l.video_url} target="_blank" rel="noopener noreferrer">Videoni ochish</a>
      ) : null}
      <div className="card"><div className="lesson-body">{l.content || 'Matn yo‘q'}</div></div>
      <div className="row between">
        {prev ? <Link className="btn secondary" href={`/student/lessons/${prev.id}`}>← Oldingi dars</Link> : <span />}
        <button className={'btn ' + (isDone ? 'secondary' : '')} data-act="done" disabled={busy} onClick={toggleDone}>
          {isDone ? '✓ Tugatilgan' : 'Darsni tugatdim'}
        </button>
        {next ? <Link className="btn secondary" href={`/student/lessons/${next.id}`}>Keyingi dars →</Link> : <span />}
      </div>
    </div>
  );
}
