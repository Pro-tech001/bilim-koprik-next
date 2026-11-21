'use client';
import Link from 'next/link';
import { useMentor } from '@/components/mentor/MentorProvider';
import { Empty } from '@/components/mentor/parts';

export default function MentorCourses() {
  const { courses, lessonsOf, studentsOf, assignments, open } = useMentor();
  return (
    <div className="form" style={{ gap: 20 }}>
      <div className="row between">
        <h1>Kurslarim</h1>
        <button className="btn" onClick={() => open('course')}>+ Yangi kurs</button>
      </div>
      <div className="grid wide">
        {courses.map((c) => (
          <div className="card" key={c.id}>
            <div className="row between">
              <h3>{c.title}</h3>
              <span className={'badge ' + (c.is_published ? 'green' : 'gray')}>{c.is_published ? 'Nashr qilingan' : 'Qoralama'}</span>
            </div>
            {c.subject && <p className="small muted">{c.subject}</p>}
            <p className="small muted">
              {lessonsOf(c.id).length} ta dars · {studentsOf(c.id).length} ta o‘quvchi · {assignments.filter((a) => a.course_id === c.id).length} ta topshiriq
            </p>
            <div className="row">
              <Link className="btn sm" href={`/mentor/courses/${c.id}`}>Boshqarish</Link>
              <button className="btn sm secondary" onClick={() => open('course', { course: c })}>Tahrirlash</button>
            </div>
          </div>
        ))}
        {!courses.length && <Empty>Hali kurs yo‘q. &quot;+ Yangi kurs&quot; tugmasini bosing.</Empty>}
      </div>
    </div>
  );
}
