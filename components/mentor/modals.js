'use client';
import { useRouter } from 'next/navigation';
import FormModal from '@/components/FormModal';
import { fmtDate, toLocalInput, normalizeLink } from '@/lib/utils';
import { useMentor } from './MentorProvider';
import { useT } from '@/lib/i18n';

function CourseSelect({ value, disabled }) {
  const { courses } = useMentor();
  const t = useT();
  return (
    <label className="field">{t('Kurs')}
      <select name="course_id" defaultValue={value || courses[0]?.id} disabled={disabled}>
        {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
    </label>
  );
}

export function CourseModal({ course: c, onClose }) {
  const { sb, me, reload, toast } = useMentor();
  const t = useT();
  const router = useRouter();

  async function onSubmit(f) {
    const row = {
      title: String(f.get('title')).trim(),
      subject: String(f.get('subject')).trim(),
      description: String(f.get('description')).trim(),
      is_published: !!f.get('pub')
    };
    if (!row.title) throw new Error(t('Kurs nomini kiriting.'));
    if (c) {
      const { error } = await sb.from('courses').update(row).eq('id', c.id);
      if (error) throw error;
      await reload();
      toast('Kurs saqlandi');
    } else {
      const { data, error } = await sb.from('courses').insert({ ...row, mentor_id: me.id }).select().single();
      if (error) throw error;
      await reload();
      toast('Kurs yaratildi');
      router.push(`/mentor/courses/${data.id}`);
    }
  }

  return (
    <FormModal title={c ? t('Kursni tahrirlash') : t('Yangi kurs')} submitLabel={c ? t('Saqlash') : t('Yaratish')} onSubmit={onSubmit} onClose={onClose}>
      <label className="field">{t('Kurs nomi')}<input name="title" required maxLength={200} defaultValue={c?.title || ''} /></label>
      <label className="field">{t('Fan / yo‘nalish')}<input name="subject" defaultValue={c?.subject || ''} placeholder={t('Masalan: Matematika')} /></label>
      <label className="field">{t('Tavsif')}<textarea name="description" defaultValue={c?.description || ''} /></label>
      <label className="row small" style={{ gap: 8 }}>
        <input type="checkbox" name="pub" style={{ width: 18, minHeight: 18 }} defaultChecked={!c || c.is_published} />
        {t('O‘quvchilarga ko‘rinsin (nashr qilish)')}
      </label>
    </FormModal>
  );
}

export function LessonModal({ lesson: l, courseId, onClose }) {
  const { sb, reload, toast, lessonsOf } = useMentor();
  const t = useT();

  async function onSubmit(f) {
    const row = {
      title: String(f.get('title')).trim(),
      video_url: normalizeLink(f.get('video_url')),
      content: String(f.get('content'))
    };
    if (!row.title) throw new Error(t('Dars nomini kiriting.'));
    if (l) {
      const { error } = await sb.from('lessons').update(row).eq('id', l.id);
      if (error) throw error;
    } else {
      const cid = f.get('course_id');
      const { error } = await sb.from('lessons').insert({ ...row, course_id: cid, position: lessonsOf(cid).length + 1 });
      if (error) throw error;
    }
    await reload();
    toast(l ? 'Dars saqlandi' : 'Dars qo‘shildi');
  }

  return (
    <FormModal title={l ? t('Darsni tahrirlash') : t('Yangi dars')} submitLabel={l ? t('Saqlash') : t('Qo‘shish')} onSubmit={onSubmit} onClose={onClose}>
      <CourseSelect value={l?.course_id || courseId} disabled={!!l} />
      <label className="field">{t('Dars nomi')}<input name="title" required maxLength={200} defaultValue={l?.title || ''} /></label>
      <label className="field">{t('Video yoki havola (YouTube, Telegram — ixtiyoriy)')}
        <input name="video_url" type="text" inputMode="url" defaultValue={l?.video_url || ''} placeholder={t('{a} yoki {b}', { a: 'https://youtu.be/...', b: 'https://t.me/kanal/12' })} />
        <span className="small muted">{t('Telegram post havolasi ({a}) dars ichida ko‘rinadi. Kanal havolasi ({b}) tugma bo‘lib chiqadi.', { a: 't.me/kanal/12', b: 't.me/kanal' })}</span>
      </label>
      <label className="field">{t('Dars matni')}<textarea name="content" style={{ minHeight: 180 }} defaultValue={l?.content || ''} /></label>
    </FormModal>
  );
}

export function AssignmentModal({ assignment: a, courseId, onClose }) {
  const { sb, reload, toast } = useMentor();
  const t = useT();

  async function onSubmit(f) {
    const due = f.get('due_at');
    const row = {
      title: String(f.get('title')).trim(),
      description: String(f.get('description')).trim(),
      due_at: due ? new Date(due).toISOString() : null,
      max_score: parseInt(f.get('max_score'), 10) || 5
    };
    if (!row.title) throw new Error(t('Topshiriq nomini kiriting.'));
    const { error } = a
      ? await sb.from('assignments').update(row).eq('id', a.id)
      : await sb.from('assignments').insert({ ...row, course_id: f.get('course_id') });
    if (error) throw error;
    await reload();
    toast(a ? 'Topshiriq saqlandi' : 'Topshiriq berildi');
  }

  return (
    <FormModal title={a ? t('Topshiriqni tahrirlash') : t('Yangi topshiriq')} submitLabel={a ? t('Saqlash') : t('Topshiriq berish')} onSubmit={onSubmit} onClose={onClose}>
      <CourseSelect value={a?.course_id || courseId} disabled={!!a} />
      <label className="field">{t('Nomi')}<input name="title" required maxLength={200} defaultValue={a?.title || ''} /></label>
      <label className="field">{t('Shart')}<textarea name="description" defaultValue={a?.description || ''} /></label>
      <div className="row" style={{ alignItems: 'flex-end' }}>
        <label className="field" style={{ flex: '2 1 200px' }}>{t('Muddat')}
          <input type="datetime-local" name="due_at" defaultValue={toLocalInput(a?.due_at)} />
        </label>
        <label className="field" style={{ flex: '1 1 120px' }}>{t('Maksimal ball')}
          <input type="number" name="max_score" min={1} max={100} defaultValue={a?.max_score || 5} />
        </label>
      </div>
    </FormModal>
  );
}

export function GradeModal({ submission: s, onClose }) {
  const { sb, reload, toast, asg } = useMentor();
  const t = useT();
  const a = asg(s.assignment_id);

  async function onSubmit(f) {
    const score = parseInt(f.get('score'), 10);
    if (isNaN(score) || score < 0 || score > a.max_score) throw new Error(t('Baho 0 dan {n} gacha bo‘lsin.', { n: a.max_score }));
    const { error } = await sb.from('submissions')
      .update({ score, feedback: String(f.get('feedback')).trim() || null })
      .eq('id', s.id);
    if (error) throw error;
    await reload();
    toast('Baho saqlandi');
  }

  return (
    <FormModal title={t('Baholash')} submitLabel={t('Bahoni saqlash')} onSubmit={onSubmit} onClose={onClose}>
      <p className="small muted">{s.student?.full_name} · {a?.title} · {fmtDate(s.submitted_at)}</p>
      <div className="lesson-body" style={{ background: 'var(--bg)', padding: 14, borderRadius: 12, maxHeight: 280, overflow: 'auto' }}>
        {s.content}
      </div>
      <label className="field">{t('Baho')} (0–{a.max_score})
        <input type="number" name="score" min={0} max={a.max_score} required defaultValue={s.score ?? ''} />
      </label>
      <label className="field">{t('Izoh (o‘quvchi ko‘radi)')}<textarea name="feedback" defaultValue={s.feedback || ''} /></label>
    </FormModal>
  );
}

// Kurs arizasiga javob: qabul / rad. Javob matni ixtiyoriy.
export function ReplyModal({ app: a, status, onClose }) {
  const { sb, loadApps, toast } = useMentor();
  const t = useT();
  const accept = status === 'accepted';

  async function onSubmit(f) {
    const { data, error } = await sb.from('applications')
      .update({ status, reply: String(f.get('reply') || '').trim() || null })
      .eq('id', a.id).select('id');
    if (error) throw error;
    await loadApps();
    if (!data?.length) throw new Error(t('Bu arizaga boshqa mentor allaqachon javob bergan.'));
    toast(accept ? 'Ariza qabul qilindi' : 'Ariza rad etildi');
  }

  return (
    <FormModal
      title={accept ? t('Arizani qabul qilish') : t('Arizani rad etish')}
      submitLabel={accept ? t('Qabul qilish') : t('Rad etish')}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <p className="small muted">
        <b>{a.student?.full_name || t('O‘quvchi')}</b> · {a.subject}<br />{t('Bo‘sh vaqti')}: {a.free_time || '—'}
      </p>
      <label className="field">
        {accept ? t('Qachon o‘tib bera olasiz? (ixtiyoriy)') : t('Sabab (ixtiyoriy)')}
        <textarea
          name="reply"
          maxLength={2000}
          defaultValue={a.reply || ''}
          placeholder={accept ? t('Masalan: Seshanba va payshanba 18:00 da, Telegram: @mening_kanalim') : t('Masalan: Hozir bu vaqtda bo‘sh emasman')}
        />
      </label>
    </FormModal>
  );
}
