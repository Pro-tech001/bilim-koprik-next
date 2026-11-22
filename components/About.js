'use client';
import Logo from './Logo';
import { useT } from '@/lib/i18n';

// "Sayt haqida" bo'limi — ikkala panelda ham bir xil.
export default function About() {
  const t = useT();
  return (
    <div className="form" style={{ gap: 20, maxWidth: 640 }}>
      <h1>{t('Sayt haqida')}</h1>
      <div className="card form about-card">
        <Logo />
        <p className="muted">{t('Bilim Ko‘prik — o‘quvchilar va mentorlarni bog‘laydigan onlayn ta’lim platformasi.')}</p>
        <dl className="app-info" id="about-info">
          <dt>{t('Yaratuvchi')}</dt><dd><b>{t('Abdug‘aniyeva Munisaxon')}</b></dd>
          <dt>{t('Kim')}</dt><dd>{t('10-sinf o‘quvchisi')}</dd>
          <dt>{t('Manzil')}</dt><dd>{t('Farg‘ona viloyati, O‘zbekiston tumani')}</dd>
          <dt>{t('Yaratilgan sana')}</dt><dd>22.11.2026</dd>
        </dl>
      </div>
    </div>
  );
}
