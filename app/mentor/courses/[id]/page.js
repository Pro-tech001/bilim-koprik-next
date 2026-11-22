'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMentor } from '@/components/mentor/MentorProvider';
import { StudentsTable, AsgRow, Empty } from '@/components/mentor/parts';
import { errText } from '@/lib/utils';

export default function MentorCourse() {
  const { id } = useParams();
  const router = useRouter();
  const { course, lessonsOf, studentsOf, assignments, open, sb, reload, toast } = useMentor();
  const c = course(id);

  if (!c) return <Empty>Kurs topilmadi. <Link href="/mentor/courses">Kurslarim</Link></Empty>;

  const ls = lessonsOf(id);
  const as = assignments.filter((a) => a.course_id === id);
  const st = studentsOf(id);

  async function removeCourse() {
    if (!confirm('Kurs, uning darslari, topshiriqlari va javoblari o‘chiriladi. Davom etasizmi?')) return;
    const { error } = await sb.from('courses').delete().eq('id', id);
    if (error) return toast(errText(error));
    await reload();
    toast('Kurs o‘chirildi');
    router.push('/mentor/courses');
  }

  async function removeLesson(lid) {
    if (!confirm('Bu darsni o‘chirasizmi? Uni qaytarib bo‘lmaydi.')) return;
    const { error } = await sb.from('lessons').delete().eq('id', lid);
    if (error) return toast(errText(error));
    await reload();
    toast('Dars o‘chirildi');
  }

  return (
    <div className="form" style={{ gap: 20 }}>
      <Link href="/mentor/courses" className="small">← Kurslarim</Link>
      <div className="row between">
        <div><h1>{c.title}</h1><p className="muted">{c.subject}</p></div>
        <div className="row">
          <button className="btn secondary sm" onClick={() => open('course', { course: c })}>Tahrirlash</button>
          <button className="btn danger sm" onClick={removeCourse}>Kursni o‘chirish</button>
        </div>
      </div>
      {c.description && <p className="muted">{c.description}</p>}

      <div className="card">
        <div className="row between">
          <h2>Darslar ({ls.length})</h2>
          <button className="btn sm" data-act="newLesson" onClick={() => open('lesson', { courseId: id })}>+ Dars qo‘shish</button>
        </div>
        <div className="list">
          {ls.map((l, i) => (
            <div className="item" key={l.id}>
              <div className="ico">{i + 1}</div>
              <div className="grow">
                <span className="t">{l.title}</span>
                <span className="small muted">{l.video_url ? (/t\.me|telegram/.test(l.video_url) ? 'Telegram · ' : 'Havola bor · ') : ''}{(l.content || '').slice(0, 80)}</span>
              </div>
              <button className="btn sm secondary" onClick={() => open('lesson', { lesson: l })}>Tahrirlash</button>
              <button className="btn sm danger" onClick={() => removeLesson(l.id)}>O‘chirish</button>
            </div>
          ))}
          {!ls.length && <Empty>Dars yo‘q</Empty>}
        </div>
      </div>

      <div className="card">
        <div className="row between">
          <h2>Topshiriqlar ({as.length})</h2>
          <button className="btn sm" data-act="newAssignment" onClick={() => open('assignment', { courseId: id })}>+ Topshiriq berish</button>
        </div>
        <div className="list">
          {as.map((a) => <AsgRow key={a.id} a={a} />)}
          {!as.length && <Empty>Topshiriq yo‘q</Empty>}
        </div>
      </div>

      <div className="card">
        <h2>Yozilgan o‘quvchilar ({st.length})</h2>
        <StudentsTable rows={st} />
      </div>
    </div>
  );
}
