'use client';
import { useMentor } from '@/components/mentor/MentorProvider';
import { AsgRow, Empty } from '@/components/mentor/parts';
import { useT } from '@/lib/i18n';

export default function MentorAssignments() {
  const { assignments, open } = useMentor();
  const t = useT();
  return (
    <div className="form" style={{ gap: 20 }}>
      <div className="row between">
        <h1>{t('Topshiriqlar')}</h1>
        <button className="btn" onClick={() => open('assignment')}>+ {t('Topshiriq berish')}</button>
      </div>
      <div className="list">
        {assignments.map((a) => <AsgRow key={a.id} a={a} />)}
        {!assignments.length && <Empty>{t('Topshiriq yo‘q')}</Empty>}
      </div>
    </div>
  );
}
