'use client';
import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { getSupabase } from '@/lib/supabase/client';
import { errText } from '@/lib/utils';

export default function ResetPage() {
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const { error } = await getSupabase().auth.updateUser({ password: new FormData(e.currentTarget).get('p') });
    setMsg(error ? { kind: 'err', text: errText(error) } : { kind: 'ok', text: 'Parol yangilandi. Endi kirishingiz mumkin.' });
  }

  return (
    <div className="auth-main" style={{ minHeight: '100vh' }}>
      <form className="auth-box form" onSubmit={submit}>
        <Logo />
        <h1>Yangi parol</h1>
        {msg && <div className={'msg ' + msg.kind} role="alert">{msg.text}</div>}
        <label className="field">Yangi parol
          <input type="password" name="p" required minLength={6} autoComplete="new-password" />
        </label>
        <button className="btn block" type="submit">Saqlash</button>
        <Link href="/" className="small">Kirish sahifasiga qaytish</Link>
      </form>
    </div>
  );
}
