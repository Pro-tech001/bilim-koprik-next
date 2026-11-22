'use client';
import { useCallback, useEffect, useState } from 'react';
import { useStudent } from '@/components/student/StudentProvider';
import { Empty } from '@/components/student/parts';
import { errText, fmtDate } from '@/lib/utils';
import { useT } from '@/lib/i18n';

const SUBJECTS = ['Matematika', 'Ingliz tili', 'Rus tili', 'Ona tili va adabiyot', 'Fizika', 'Kimyo', 'Biologiya', 'Tarix', 'Geografiya', 'Informatika', 'Dasturlash'];

export default function Apply() {
  const { sb, me, toast } = useStudent();
  const [list, setList] = useState(undefined); // undefined = yuklanmoqda, null = jadval yo'q
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const t = useT();

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
    if (!row.subject) return setErr(t('Qaysi fan qiziqtirishini yozing.'));
    if (!row.free_time) return setErr(t('Bo‘sh vaqtlaringizni yozing — mentor shunga qarab javob beradi.'));
    setBusy(true);
    const { error } = await sb.from('applications').insert(row);
    setBusy(false);
    if (error) return setErr(errText(error));
    form.reset();
    toast('Ariza yuborildi! Mentorlar javobini shu sahifada ko‘rasiz.');
    load();
  }

  async function cancel(id) {
    if (!confirm(t('Arizani bekor qilasizmi?'))) return;
    const { error } = await sb.from('applications').delete().eq('id', id);
    if (error) return toast(errText(error));
    toast('Ariza bekor qilindi');
    load();
  }

  if (list === null) {
    return (
      <div className="form" style={{ gap: 20 }}>
        <h1>{t('Kursga ariza')}</h1>
        <div className="msg err">{t('Bu bo‘lim hali yoqilmagan. Admin Supabase’da {f} faylini ishga tushirishi kerak.', { f: 'supabase/arizalar.sql' })}</div>
      </div>
    );
  }

  return (
    <div className="form" style={{ gap: 20 }}>
      <div>
        <h1>{t('Kursga ariza')}</h1>
        <p className="muted">{t('Nimani o‘rganmoqchi ekaningizni va qachon bo‘sh ekaningizni yozing. Arizangizni barcha mentorlar ko‘radi va mos kelgani javob beradi.')}</p>
      </div>

      <form className="card form" id="applyForm" onSubmit={onSubmit} noValidate>
        <label className="field">{t('Qaysi fan qiziqtiradi?')}
          <input name="subject" list="subjects" required maxLength={120} placeholder={t('Masalan: Ingliz tili')} />
          <datalist id="subjects">{SUBJECTS.map((s) => <option key={s} value={t(s)} />)}</datalist>
        </label>
        <label className="field">{t('Nimani o‘rganmoqchisiz?')}
          <textarea name="goal" maxLength={2000} placeholder={t('Masalan: 0 dan boshlab gaplashishni o‘rganmoqchiman, IELTS ga tayyorlanmoqchiman')} />
        </label>
        <label className="field">{t('Bo‘sh vaqtlaringiz qanday?')}
          <textarea name="free_time" required maxLength={1000} style={{ minHeight: 80 }} placeholder={t('Masalan: Dushanba–juma 17:00–20:00, shanba kun bo‘yi')} />
        </label>
        {err && <div className="msg err" id="message">{err}</div>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn" type="submit" disabled={busy}>{busy ? t('Yuborilmoqda...') : t('Ariza yuborish')}</button>
        </div>
      </form>

      <div className="card">
        <h2>{t('Mening arizalarim')}</h2>
        {list === undefined && <p className="muted">{t('Yuklanmoqda...')}</p>}
        {list && (
          <div className="list">
            {list.map((a) => (
              <div className="item app-item" key={a.id}>
                <div className="grow">
                  <span className="t">{a.subject}</span>
                  <span className="small muted">{t('Yuborildi')}: {fmtDate(a.created_at)} · {t('Bo‘sh vaqt')}: {a.free_time || '—'}</span>
                  {a.status !== 'new' && (
                    <span className="small reply">
                      <b>{a.mentor?.full_name || t('Mentor')}:</b> {a.reply || (a.status === 'accepted' ? t('Arizangizni qabul qildi.') : t('Hozircha qabul qila olmaydi.'))}
                    </span>
                  )}
                </div>
                {a.status === 'accepted' && <span className="badge green">{t('Qabul qilindi')}</span>}
                {a.status === 'declined' && <span className="badge gray">{t('Rad etildi')}</span>}
                {a.status === 'new' && <span className="badge orange">{t('Kutilmoqda')}</span>}
                <button className="btn sm danger" onClick={() => cancel(a.id)}>{a.status === 'new' ? t('Bekor qilish') : t('O‘chirish')}</button>
              </div>
            ))}
            {!list.length && <Empty>{t('Hali ariza yubormagansiz.')}</Empty>}
          </div>
        )}
      </div>
    </div>
  );
}
