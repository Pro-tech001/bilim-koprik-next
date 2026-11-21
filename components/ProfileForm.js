'use client';
import { getSupabase } from '@/lib/supabase/client';
import { errText } from '@/lib/utils';
import { useToast } from './Toast';

export default function ProfileForm({ me, onSaved, withBio = false }) {
  const toast = useToast();
  const sb = getSupabase();

  async function saveProfile(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const upd = { full_name: String(f.get('full_name')).trim(), phone: String(f.get('phone')).trim() };
    if (withBio) upd.bio = String(f.get('bio')).trim();
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
      <h1>Profil</h1>
      <form className="card form" onSubmit={saveProfile}>
        <label className="field">Ism-familiya<input name="full_name" defaultValue={me.full_name} required /></label>
        <label className="field">Telefon<input name="phone" defaultValue={me.phone || ''} /></label>
        {withBio && (
          <label className="field">O‘zingiz haqingizda (o‘quvchilar ko‘radi)
            <textarea name="bio" defaultValue={me.bio || ''} />
          </label>
        )}
        <button className="btn" type="submit">Saqlash</button>
      </form>
      <form className="card form" onSubmit={savePassword}>
        <h2>Parolni o‘zgartirish</h2>
        <label className="field">Yangi parol<input type="password" name="p" minLength={6} required autoComplete="new-password" /></label>
        <button className="btn secondary" type="submit">Parolni yangilash</button>
      </form>
    </div>
  );
}
