'use client';
import { useState } from 'react';
import { useMentor } from '@/components/mentor/MentorProvider';
import { StudentsTable } from '@/components/mentor/parts';
import { useT } from '@/lib/i18n';

export default function Students() {
  const { enrollments, courses, studentsOf } = useMentor();
  const [cid, setCid] = useState('');
  const t = useT();
  return (
    <div className="form" style={{ gap: 20 }}>
      <h1>{t('O‘quvchilar')}</h1>
      <div className="row">
        <label className="field" style={{ maxWidth: 320, flex: 1 }}>{t('Kurs bo‘yicha filtr')}
          <select value={cid} onChange={(e) => setCid(e.target.value)}>
            <option value="">{t('Barcha kurslar')}</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
      </div>
      <div className="card"><StudentsTable rows={cid ? studentsOf(cid) : enrollments} /></div>
    </div>
  );
}
