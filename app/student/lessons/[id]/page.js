'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStudent } from '@/components/student/StudentProvider';
import { Empty } from '@/components/student/parts';
import { errText, linkInfo } from '@/lib/utils';

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
  const media = linkInfo(l.video_url);
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
      {media?.kind === 'youtube' && (
        <div className="video"><iframe src={media.embed} title={l.title} allowFullScreen /></div>
      )}
      {media?.kind === 'telegram-post' && (
        <div className="tg-post">
          <iframe src={media.embed} title={l.title} loading="lazy" />
          <a className="btn secondary" href={media.url} target="_blank" rel="noopener noreferrer">Telegram’da ochish</a>
        </div>
      )}
      {media?.kind === 'telegram' && (
        <a className="btn tg" href={media.url} target="_blank" rel="noopener noreferrer">Telegram kanalni ochish</a>
      )}
      {media?.kind === 'link' && (
        <a className="btn secondary" href={media.url} target="_blank" rel="noopener noreferrer">Materialni ochish</a>
      )}
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
