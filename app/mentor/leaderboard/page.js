'use client';
import { useState } from 'react';
import { useMentor } from '@/components/mentor/MentorProvider';
import { Empty } from '@/components/mentor/parts';
import { useT } from '@/lib/i18n';
import { xpOf, levelOf, BADGES } from '@/lib/xp';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { enrollments, courses, lessons, progress, subs, asg, lessonsOf } = useMentor();
  const t = useT();
  const [cid, setCid] = useState('');

  const myLessons = new Set(lessons.filter((l) => !cid || l.course_id === cid).map((l) => l.id));
  const people = new Map();
  for (const e of enrollments) {
    if (cid && e.course_id !== cid) continue;
    if (!people.has(e.student_id)) people.set(e.student_id, { id: e.student_id, name: e.student?.full_name || '—', courses: [] });
    people.get(e.student_id).courses.push(e.course_id);
  }
  const rows = [...people.values()].map((p) => {
    const done = progress.filter((x) => x.student_id === p.id && myLessons.has(x.lesson_id));
    const mine = subs.filter((s) => s.student_id === p.id && (!cid || asg(s.assignment_id)?.course_id === cid));
    const ratios = mine.filter((s) => s.score != null).map((s) => s.score / (asg(s.assignment_id)?.max_score || 1));
    const doneSet = new Set(done.map((x) => x.lesson_id));
    const st = {
      lessonsDone: done.length, submissions: mine.length, ratios, courses: p.courses.length,
      coursesDone: p.courses.filter((c) => { const ls = lessonsOf(c); return ls.length && ls.every((l) => doneSet.has(l.id)); }).length
    };
    const xp = xpOf(st);
    return { ...p, xp, level: levelOf(xp), badges: BADGES.filter((b) => b.ok(st)) };
  }).sort((a, b) => b.xp - a.xp);

  return (
    <div className="form" style={{ gap: 20 }}>
      <div>
        <h1>{t('Reyting')}</h1>
        <p className="muted">{t('O‘quvchilaringiz sizning kurslaringizda yig‘gan XP bo‘yicha.')}</p>
      </div>
      <label className="field" style={{ maxWidth: 320 }}>{t('Kurs bo‘yicha filtr')}
        <select value={cid} onChange={(e) => setCid(e.target.value)}>
          <option value="">{t('Barcha kurslar')}</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </label>
      <div className="card">
        {!rows.length ? <Empty>{t('Hali o‘quvchi yo‘q. Kurs yaratganingizdan so‘ng o‘quvchilar katalogdan yozilishadi.')}</Empty> : (
          <div className="list" id="leaderboard">
            {rows.map((r, i) => (
              <div className={'item lb-row' + (i < 3 ? ' top' : '')} key={r.id}>
                <span className="lb-rank" aria-label={t('{n}-o‘rin', { n: i + 1 })}>{MEDALS[i] || i + 1}</span>
                <div className="grow">
                  <span className="t">{r.name}</span>
                  <span className="small muted">{t('{n}-daraja', { n: r.level.n })} · {t(r.level.name)} · {r.badges.map((b) => b.icon).join(' ') || t('nishon yo‘q')}</span>
                </div>
                <b className="lb-xp">{r.xp} XP</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
