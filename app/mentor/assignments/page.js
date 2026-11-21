'use client';
import { useMentor } from '@/components/mentor/MentorProvider';
import { AsgRow, Empty } from '@/components/mentor/parts';

export default function MentorAssignments() {
  const { assignments, open } = useMentor();
  return (
    <div className="form" style={{ gap: 20 }}>
      <div className="row between">
        <h1>Topshiriqlar</h1>
        <button className="btn" onClick={() => open('assignment')}>+ Topshiriq berish</button>
      </div>
      <div className="list">
        {assignments.map((a) => <AsgRow key={a.id} a={a} />)}
        {!assignments.length && <Empty>Topshiriq yo‘q</Empty>}
      </div>
    </div>
  );
}
