'use client';
import Link from 'next/link';
import { useMentor } from '@/components/mentor/MentorProvider';
import { StudentsTable, PendingList } from '@/components/mentor/parts';

const cardBtn = { textAlign: 'left', cursor: 'pointer', font: 'inherit' };

export default function MentorHome() {
  const { enrollments, courses, lessons, pending, open } = useMentor();
  const uniq = new Set(enrollments.map((e) => e.student_id)).size;

  return (
    <div className="form" style={{ gap: 24 }}>
      <div className="row between">
        <div>
          <h1>Mentor paneli</h1>
          <p className="muted">{pending ? `${pending} ta topshiriq baholashni kutmoqda.` : 'Barcha topshiriqlar baholangan.'}</p>
        </div>
        <button className="btn" data-act="newCourse" onClick={() => open('course')}>+ Yangi kurs</button>
      </div>

      <div className="grid">
        <button className="card" style={cardBtn} onClick={() => open('course')}>
          <span className="ico">+</span><b>Kurs yaratish</b><span className="small muted">Yangi kurs va tavsif</span>
        </button>
        <button className="card" style={cardBtn} onClick={() => open('lesson')}>
          <span className="ico">+</span><b>Dars qo‘shish</b><span className="small muted">Matn va video havola</span>
        </button>
        <button className="card" style={cardBtn} onClick={() => open('assignment')}>
          <span className="ico">+</span><b>Topshiriq berish</b><span className="small muted">Muddat va maksimal ball bilan</span>
        </button>
        <Link className="card" style={{ textDecoration: 'none', color: 'inherit' }} href="/mentor/grading">
          <span className="ico">✓</span><b>Baholash</b><span className="small muted">{pending} ta javob kutmoqda</span>
        </Link>
      </div>

      <div className="grid">
        <div className="stat"><span>O‘quvchilar</span><b>{uniq}</b></div>
        <div className="stat"><span>Kurslar</span><b>{courses.length}</b></div>
        <div className="stat"><span>Darslar</span><b>{lessons.length}</b></div>
        <div className="stat"><span>Baholash kutilmoqda</span><b>{pending}</b></div>
      </div>

      <div className="row" style={{ alignItems: 'stretch', gap: 20 }}>
        <div className="card" style={{ flex: '3 1 480px' }}>
          <div className="row between"><h2>O‘quvchilarim</h2><Link href="/mentor/students" className="small">Barchasi</Link></div>
          <StudentsTable rows={enrollments.slice(0, 6)} />
        </div>
        <div className="card" style={{ flex: '2 1 300px' }}>
          <h2>Baholash kutilmoqda</h2>
          <div className="list"><PendingList limit={5} /></div>
        </div>
      </div>
    </div>
  );
}
