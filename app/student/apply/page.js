'use client';
import { useCallback, useEffect, useState } from 'react';
import { useStudent } from '@/components/student/StudentProvider';
import { Empty } from '@/components/student/parts';
import { errText, fmtDate } from '@/lib/utils';

const SUBJECTS = ['Matematika', 'Ingliz tili', 'Rus tili', 'Ona tili va adabiyot', 'Fizika', 'Kimyo', 'Biologiya', 'Tarix', 'Geografiya', 'Informatika', 'Dasturlash'];

export default function Apply() {
  const { sb, me, toast } = useStudent();
  const [list, setList] = useState(undefined); // undefined = yuklanmoqda, null = jadval yo'q
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await sb.from('applications')
      .select('*, mentor:profiles!mentor_id(full_name)')
      .eq('student_id', me.id)
      .order('created_at', { ascending: false });
    if (error) return setList(error.code === 'PGRST205' || error.code === '42P01' ? null : []);
    setList(data);
  }, [sb, me.id]);

  useEffect(() => { load(); }, [load]);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const row = {
      student_id: me.id,
      subject: String(f.get('subject')).trim(),
      goal: String(f.get('goal')).trim(),
      free_time: String(f.get('free_time')).trim()
    };
    setErr('');
    if (!row.subject) return setErr('Qaysi fan qiziqtirishini yozing.');
    if (!row.free_time) return setErr('Bo‘sh vaqtlaringizni yozing — mentor shunga qarab javob beradi.');
    setBusy(true);
    const { error } = await sb.from('applications').insert(row);
    setBusy(false);
    if (error) return setErr(errText(error));
    form.reset();
    toast('Ariza yuborildi! Mentorlar javobini shu sahifada ko‘rasiz.');
    load();
  }

  async function cancel(id) {
    if (!confirm('Arizani bekor qilasizmi?')) return;
    const { error } = await sb.from('applications').delete().eq('id', id);
    if (error) return toast(errText(error));
    toast('Ariza bekor qilindi');
    load();
  }

  if (list === null) {
    return (
      <div className="form" style={{ gap: 20 }}>
        <h1>Kursga ariza</h1>
        <div className="msg err">Bu bo‘lim hali yoqilmagan. Admin Supabase’da <b>supabase/arizalar.sql</b> faylini ishga tushirishi kerak.</div>
      </div>
    );
  }

  return (
    <div className="form" style={{ gap: 20 }}>
      <div>
        <h1>Kursga ariza</h1>
        <p className="muted">Nimani o‘rganmoqchi ekaningizni va qachon bo‘sh ekaningizni yozing. Arizangizni barcha mentorlar ko‘radi va mos kelgani javob beradi.</p>
      </div>

      <form className="card form" id="applyForm" onSubmit={onSubmit} noValidate>
        <label className="field">Qaysi fan qiziqtiradi?
          <input name="subject" list="subjects" required maxLength={120} placeholder="Masalan: Ingliz tili" />
          <datalist id="subjects">{SUBJECTS.map((s) => <option key={s} value={s} />)}</datalist>
        </label>
        <label className="field">Nimani o‘rganmoqchisiz?
          <textarea name="goal" maxLength={2000} placeholder="Masalan: 0 dan boshlab gaplashishni o‘rganmoqchiman, IELTS ga tayyorlanmoqchiman" />
        </label>
        <label className="field">Bo‘sh vaqtlaringiz qanday?
          <textarea name="free_time" required maxLength={1000} style={{ minHeight: 80 }} placeholder="Masalan: Dushanba–juma 17:00–20:00, shanba kun bo‘yi" />
        </label>
        {err && <div className="msg err" id="message">{err}</div>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn" type="submit" disabled={busy}>{busy ? 'Yuborilmoqda...' : 'Ariza yuborish'}</button>
        </div>
      </form>

      <div className="card">
        <h2>Mening arizalarim</h2>
        {list === undefined && <p className="muted">Yuklanmoqda...</p>}
        {list && (
          <div className="list">
            {list.map((a) => (
              <div className="item app-item" key={a.id}>
                <div className="grow">
                  <span className="t">{a.subject}</span>
                  <span className="small muted">Yuborildi: {fmtDate(a.created_at)} · Bo‘sh vaqt: {a.free_time || '—'}</span>
                  {a.status !== 'new' && (
                    <span className="small reply">
                      <b>{a.mentor?.full_name || 'Mentor'}:</b> {a.reply || (a.status === 'accepted' ? 'Arizangizni qabul qildi.' : 'Hozircha qabul qila olmaydi.')}
                    </span>
                  )}
                </div>
                {a.status === 'accepted' && <span className="badge green">Qabul qilindi</span>}
                {a.status === 'declined' && <span className="badge gray">Rad etildi</span>}
                {a.status === 'new' && <span className="badge orange">Kutilmoqda</span>}
                <button className="btn sm danger" onClick={() => cancel(a.id)}>{a.status === 'new' ? 'Bekor qilish' : 'O‘chirish'}</button>
              </div>
            ))}
            {!list.length && <Empty>Hali ariza yubormagansiz.</Empty>}
          </div>
        )}
      </div>
    </div>
  );
}
