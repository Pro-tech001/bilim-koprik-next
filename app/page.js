'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { getSupabase } from '@/lib/supabase/client';
import { errText } from '@/lib/utils';

const HINTS = {
  student: 'O‘quvchi sifatida kurslarga yozilasiz, darslarni o‘rganasiz, topshiriq topshirasiz va natijangizni ko‘rasiz.',
  mentor: 'Mentor sifatida kurs va darslar yaratasiz, topshiriq berasiz, baholaysiz va o‘quvchilaringizni kuzatasiz.'
};

export default function AuthPage() {
  const router = useRouter();
  const sb = getSupabase();
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('student');
  const [msg, setMsg] = useState(null); // { text, kind }
  const [busy, setBusy] = useState(false);

  const show = (text, kind = 'err') => setMsg({ text, kind });

  async function goHome(userId) {
    const { data: p } = await sb.from('profiles').select('role').eq('id', userId).single();
    if (!p) return show('Profil topilmadi. Bazada schema.sql ishga tushirilganini tekshiring.');
    router.replace(p.role === 'mentor' ? '/mentor' : '/student');
    router.refresh();
  }

  async function onLogin(e) {
    e.preventDefault();
    setMsg(null);
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const { data, error } = await sb.auth.signInWithPassword({
      email: String(f.get('email')).trim(),
      password: String(f.get('password'))
    });
    if (error) { setBusy(false); return show(errText(error)); }
    await goHome(data.user.id);
    setBusy(false);
  }

  async function onRegister(e) {
    e.preventDefault();
    setMsg(null);
    const form = e.currentTarget;
    const f = new FormData(form);
    const full_name = String(f.get('full_name')).trim();
    const email = String(f.get('email')).trim();
    const password = String(f.get('password'));
    if (!full_name) return show('Ism-familiyani kiriting.');
    if (!email.includes('@')) return show('To‘g‘ri email kiriting.');
    if (password.length < 6) return show('Parol kamida 6 ta belgidan iborat bo‘lsin.');
    if (password !== f.get('password2')) return show('Parollar bir xil emas.');

    setBusy(true);
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone: String(f.get('phone')).trim(), role },
        emailRedirectTo: `${location.origin}/auth/callback`
      }
    });
    setBusy(false);
    if (error) return show(errText(error));
    if (data.session) return goHome(data.user.id);
    form.reset();
    show(`Ro‘yxatdan o‘tdingiz! ${email} manziliga tasdiqlash xati yuborildi. Havolani bosib, keyin kiring.`, 'ok');
  }

  async function onForgot(e) {
    e.preventDefault();
    const email = document.querySelector('#loginForm [name=email]')?.value.trim();
    if (!email) return show('Avval email manzilingizni yozing, keyin "Parolni unutdingizmi?" ni bosing.');
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset`
    });
    if (error) return show(errText(error));
    show(`Parolni tiklash havolasi ${email} manziliga yuborildi.`, 'ok');
  }

  const switchTab = (t) => { setTab(t); setMsg(null); };

  return (
    <div className="auth">
      <section className="auth-side">
        <Logo />
        <div>
          <h1>Bilimdan natijagacha — bitta ko‘prik.</h1>
          <p>O‘quvchilar o‘rganadi, mentorlar yo‘l ko‘rsatadi. Har biri o‘z paneli va o‘z imkoniyatlari bilan.</p>
        </div>
        <div className="auth-cards">
          <div><b style={{ color: 'var(--blue-lt)' }}>O‘quvchi</b>Darslar, topshiriqlar, o‘z natijalari</div>
          <div><b style={{ color: 'var(--orange-lt)' }}>Mentor</b>Kurs yaratish, baholash, o‘quvchilar nazorati</div>
        </div>
      </section>

      <section className="auth-main">
        <div className="auth-box">
          <div className="tabs" role="group" aria-label="Kirish yoki ro‘yxatdan o‘tish">
            <button type="button" aria-pressed={tab === 'login'} onClick={() => switchTab('login')}>Kirish</button>
            <button type="button" aria-pressed={tab === 'register'} onClick={() => switchTab('register')}>Ro‘yxatdan o‘tish</button>
          </div>

          {msg && <div id="message" className={'msg ' + msg.kind} role="alert">{msg.text}</div>}

          {tab === 'login' ? (
            <form id="loginForm" className="form" onSubmit={onLogin} noValidate>
              <div>
                <h1>Xush kelibsiz</h1>
                <p className="muted">Hisobingizga kiring — panelingiz rolingizga qarab ochiladi.</p>
              </div>
              <label className="field">Email
                <input type="email" name="email" autoComplete="email" required placeholder="siz@misol.uz" />
              </label>
              <label className="field">Parol
                <input type="password" name="password" autoComplete="current-password" required placeholder="••••••••" />
              </label>
              <div className="row between small">
                <span />
                <a href="#" onClick={onForgot}>Parolni unutdingizmi?</a>
              </div>
              <button className="btn block" type="submit" disabled={busy}>{busy ? 'Kirilmoqda...' : 'Kirish'}</button>
            </form>
          ) : (
            <form id="registerForm" className="form" onSubmit={onRegister} noValidate>
              <div>
                <h1>Ro‘yxatdan o‘tish</h1>
                <p className="muted">Kim sifatida qo‘shilasiz?</p>
              </div>
              <div className="tabs role" role="group" aria-label="Rolni tanlang">
                <button type="button" data-role="student" aria-pressed={role === 'student'} onClick={() => setRole('student')}>O‘quvchi</button>
                <button type="button" data-role="mentor" aria-pressed={role === 'mentor'} onClick={() => setRole('mentor')}>Mentor</button>
              </div>
              <p className="small muted">{HINTS[role]}</p>
              <label className="field">Ism-familiya
                <input type="text" name="full_name" autoComplete="name" required placeholder="Ism Familiya" />
              </label>
              <label className="field">Telefon
                <input type="tel" name="phone" autoComplete="tel" placeholder="+998 90 123 45 67" />
              </label>
              <label className="field">Email
                <input type="email" name="email" autoComplete="email" required placeholder="siz@misol.uz" />
              </label>
              <label className="field">Parol
                <input type="password" name="password" autoComplete="new-password" required minLength={6} placeholder="Kamida 6 ta belgi" />
              </label>
              <label className="field">Parolni tasdiqlang
                <input type="password" name="password2" autoComplete="new-password" required minLength={6} />
              </label>
              <button
                className="btn block"
                type="submit"
                id="registerBtn"
                disabled={busy}
                style={{ background: role === 'mentor' ? 'var(--orange)' : 'var(--blue)' }}
              >
                {role === 'mentor' ? 'Mentor sifatida ro‘yxatdan o‘tish' : 'O‘quvchi sifatida ro‘yxatdan o‘tish'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
