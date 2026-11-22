'use client';
import { getSupabase } from '@/lib/supabase/client';
import { errText } from '@/lib/utils';
import { useToast } from './Toast';
import { useT } from '@/lib/i18n';

export default function ProfileForm({ me, onSaved, withBio = false }) {
  const toast = useToast();
  const sb = getSupabase();
  const t = useT();

  async function saveProfile(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const upd = { full_name: String(f.get('full_name')).trim(), phone: String(f.get('phone')).trim() };
    if (withBio) upd.bio = String(f.get('bio')).trim();
    if (withBio && 'certificate' in me) { // mentorlar.sql ishga tushirilgan bo'lsa
      upd.certificate = String(f.get('certificate') || '').trim() || null;
      upd.show_in_ticker = !!f.get('show_in_ticker');
    }
    const { error } = await sb.from('profiles').update(upd).eq('id', me.id);
    if (error) return toast(errText(error));
    onSaved(upd);
    toast('Saqlandi');
  }

  async function savePassword(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const { error } = await sb.auth.updateUser({ password: new FormData(form).get('p') });
    toast(error ? errText(error) : 'Parol yangilandi');
    if (!error) form.reset();
  }

  return (
    <div className="form" style={{ gap: 20, maxWidth: 560 }}>
      <h1>{t('Profil')}</h1>
      <form className="card form" onSubmit={saveProfile}>
        <label className="field">{t('Ism-familiya')}<input name="full_name" defaultValue={me.full_name} required /></label>
        <label className="field">{t('Telefon')}<input name="phone" defaultValue={me.phone || ''} /></label>
        {withBio && (
          <label className="field">{t('O‘zingiz haqingizda (o‘quvchilar ko‘radi)')}
            <textarea name="bio" defaultValue={me.bio || ''} />
          </label>
        )}
        {withBio && 'certificate' in me && (
          <>
            <label className="field">{t('Sertifikat (ixtiyoriy)')}
              <input name="certificate" maxLength={120} defaultValue={me.certificate || ''} placeholder={t('Masalan: IELTS 8.0, CEFR C1, Milliy sertifikat A+')} />
            </label>
            <label className="row small" style={{ gap: 8 }}>
              <input type="checkbox" name="show_in_ticker" style={{ width: 18, minHeight: 18 }} defaultChecked={me.show_in_ticker !== false} />
              {t('Ismim kirish sahifasidagi mentorlar lentasida ko‘rinsin')}
            </label>
          </>
        )}
        <button className="btn" type="submit">{t('Saqlash')}</button>
      </form>
      <form className="card form" onSubmit={savePassword}>
        <h2>{t('Parolni o‘zgartirish')}</h2>
        <label className="field">{t('Yangi parol')}<input type="password" name="p" minLength={6} required autoComplete="new-password" /></label>
        <button className="btn secondary" type="submit">{t('Parolni yangilash')}</button>
      </form>
    </div>
  );
}
