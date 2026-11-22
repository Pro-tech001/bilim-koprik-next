'use client';
import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { getSupabase } from '@/lib/supabase/client';
import { errText } from '@/lib/utils';
import { useT, LangSwitch } from '@/lib/i18n';

export default function ResetPage() {
  const [msg, setMsg] = useState(null);
  const t = useT();

  async function submit(e) {
    e.preventDefault();
    const { error } = await getSupabase().auth.updateUser({ password: new FormData(e.currentTarget).get('p') });
    setMsg(error ? { kind: 'err', text: errText(error) } : { kind: 'ok', text: t('Parol yangilandi. Endi kirishingiz mumkin.') });
  }

  return (
    <div className="auth-main" style={{ minHeight: '100vh' }}>
      <form className="auth-box form" onSubmit={submit}>
        <div className="row between"><Logo /><LangSwitch /></div>
        <h1>{t('Yangi parol')}</h1>
        {msg && <div className={'msg ' + msg.kind} role="alert">{msg.text}</div>}
        <label className="field">{t('Yangi parol')}
          <input type="password" name="p" required minLength={6} autoComplete="new-password" />
        </label>
        <button className="btn block" type="submit">{t('Saqlash')}</button>
        <Link href="/" className="small">{t('Kirish sahifasiga qaytish')}</Link>
      </form>
    </div>
  );
}
