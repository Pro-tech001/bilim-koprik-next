'use client';
import Link from 'next/link';
import { useStudent } from '@/components/student/StudentProvider';
import { CourseRow, Empty } from '@/components/student/parts';

export default function MyCourses() {
  const { courses } = useStudent();
  return (
    <div className="form" style={{ gap: 20 }}>
      <div className="row between">
        <h1>Kurslarim</h1>
        <Link className="btn" href="/student/catalog">Yangi kursga yozilish</Link>
      </div>
      <div className="list">
        {courses.map((c) => <CourseRow key={c.id} c={c} />)}
        {!courses.length && <Empty>Hali kursga yozilmagansiz.</Empty>}
      </div>
    </div>
  );
}
