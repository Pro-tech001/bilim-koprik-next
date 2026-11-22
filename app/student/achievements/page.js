'use client';
import { useStudent } from '@/components/student/StudentProvider';
import LevelCard from '@/components/student/LevelCard';
import { useT } from '@/lib/i18n';
import { XP, LEVELS } from '@/lib/xp';

export default function Achievements() {
  const { game } = useStudent();
  const t = useT();
  const { st } = game;
  const graded = Math.round(st.ratios.reduce((s, r) => s + r * XP.grade, 0));
  return (
    <div className="form" style={{ gap: 20 }}>
      <div>
        <h1>{t('Yutuqlarim')}</h1>
        <p className="muted">{t('Darslarni tugating, topshiriqlarni topshiring va yuqori baho oling: XP yig‘ilib, darajangiz oshadi.')}</p>
      </div>
      <LevelCard full />

      <div className="card">
        <h2>{t('XP qayerdan keldi')}</h2>
        <div className="table-wrap">
          <table>
            <tbody>
              <tr><td>{t('Tugatilgan darslar')}</td><td className="num">{st.lessonsDone} × {XP.lesson}</td><td className="num"><b>{st.lessonsDone * XP.lesson} XP</b></td></tr>
              <tr><td>{t('Topshirilgan javoblar')}</td><td className="num">{st.submissions} × {XP.submit}</td><td className="num"><b>{st.submissions * XP.submit} XP</b></td></tr>
              <tr><td>{t('Baholar (100% = {n} XP)', { n: XP.grade })}</td><td className="num">{st.ratios.length}</td><td className="num"><b>{graded} XP</b></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>{t('Nishonlar')} ({game.badges.filter((b) => b.got).length}/{game.badges.length})</h2>
        <div className="badges">
          {game.badges.map((b) => (
            <div key={b.id} className={'badge-tile' + (b.got ? ' got' : '')} data-badge={b.id}>
              <span className="ico" aria-hidden="true">{b.icon}</span>
              <b>{t(b.name)}</b>
              <span className="small muted">{t(b.desc)}</span>
              <span className={'badge ' + (b.got ? 'green' : 'gray')}>{b.got ? t('Olingan') : t('Yopiq')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>{t('Darajalar')}</h2>
        <div className="levels">
          {LEVELS.map((l, i) => (
            <div key={l.name} className={'lvl-row' + (game.level.n === i + 1 ? ' cur' : '')}>
              <span className="lvl-num">{i + 1}</span><span className="grow">{t(l.name)}</span><span className="small muted">{l.min}+ XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
