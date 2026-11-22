'use client';
import Link from 'next/link';
import { useStudent } from './StudentProvider';
import { useT } from '@/lib/i18n';

// Daraja kartasi: bosh sahifada ixcham, Yutuqlarim sahifasida to'liq.
export default function LevelCard({ full = false }) {
  const { game } = useStudent();
  const t = useT();
  const { level, xp } = game;
  const got = game.badges.filter((b) => b.got).length;
  return (
    <div className="level-card" data-level={level.n}>
      <div className="lvl-badge" aria-hidden="true"><span>{level.n}</span></div>
      <div className="grow">
        <span className="k">{t('{n}-daraja', { n: level.n })}</span>
        <h2>{t(level.name)}</h2>
        <div className="xpbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={level.pct}><div style={{ width: level.pct + '%' }} /></div>
        <span className="small">
          <b id="xp-value">{xp} XP</b>
          {level.next != null ? ' · ' + t('keyingi darajagacha {n} XP', { n: level.next - xp }) : ' · ' + t('eng yuqori daraja!')}
        </span>
      </div>
      {!full && (
        <Link className="btn secondary sm" href="/student/achievements">{t('Nishonlar')} {got}/{game.badges.length}</Link>
      )}
    </div>
  );
}
