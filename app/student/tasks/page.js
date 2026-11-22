'use client';
import { useState } from 'react';
import { useStudent } from '@/components/student/StudentProvider';
import { TaskRow, Empty } from '@/components/student/parts';
import { useT } from '@/lib/i18n';

const NAMES = { todo: 'Bajarilishi kerak', sent: 'Topshirilgan', graded: 'Baholangan' };

export default function Tasks() {
  const { assignments, subs } = useStudent();
  const [tab, setTab] = useState('todo');
  const t = useT();
  const groups = {
    todo: assignments.filter((a) => !subs.has(a.id)),
    sent: assignments.filter((a) => subs.has(a.id) && subs.get(a.id).score == null),
    graded: assignments.filter((a) => subs.get(a.id)?.score != null)
  };

  return (
    <div className="form" style={{ gap: 20 }}>
      <h1>{t('Topshiriqlar')}</h1>
      <div className="tabs" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))', maxWidth: 560 }}>
        {Object.keys(NAMES).map((k) => (
          <button key={k} type="button" aria-pressed={k === tab} onClick={() => setTab(k)}>
            {t(NAMES[k])} ({groups[k].length})
          </button>
        ))}
      </div>
      <div className="list">
        {groups[tab].map((a) => <TaskRow key={a.id} a={a} />)}
        {!groups[tab].length && <Empty>{t('Bu bo‘limda topshiriq yo‘q')}</Empty>}
      </div>
    </div>
  );
}
