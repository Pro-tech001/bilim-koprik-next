'use client';
import { useRouter } from 'next/navigation';
import FormModal from '@/components/FormModal';
import { fmtDate, toLocalInput, normalizeLink } from '@/lib/utils';
import { useMentor } from './MentorProvider';

function CourseSelect({ value, disabled }) {
  const { courses } = useMentor();
  return (
    <label className="field">Kurs
      <select name="course_id" defaultValue={value || courses[0]?.id} disabled={disabled}>
        {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
    </label>
  );
}

export function CourseModal({ course: c, onClose }) {
  const { sb, me, reload, toast } = useMentor();
  const router = useRouter();

  async function onSubmit(f) {
    const row = {
      title: String(f.get('title')).trim(),
      subject: String(f.get('subject')).trim(),
      description: String(f.get('description')).trim(),
      is_published: !!f.get('pub')
    };
    if (!row.title) throw new Error('Kurs nomini kiriting.');
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
    <FormModal title={c ? 'Kursni tahrirlash' : 'Yangi kurs'} submitLabel={c ? 'Saqlash' : 'Yaratish'} onSubmit={onSubmit} onClose={onClose}>
      <label className="field">Kurs nomi<input name="title" required maxLength={200} defaultValue={c?.title || ''} /></label>
      <label className="field">Fan / yo‘nalish<input name="subject" defaultValue={c?.subject || ''} placeholder="Masalan: Matematika" /></label>
      <label className="field">Tavsif<textarea name="description" defaultValue={c?.description || ''} /></label>
      <label className="row small" style={{ gap: 8 }}>
        <input type="checkbox" name="pub" style={{ width: 18, minHeight: 18 }} defaultChecked={!c || c.is_published} />
        O‘quvchilarga ko‘rinsin (nashr qilish)
      </label>
    </FormModal>
  );
}

export function LessonModal({ lesson: l, courseId, onClose }) {
  const { sb, reload, toast, lessonsOf } = useMentor();

  async function onSubmit(f) {
    const row = {
      title: String(f.get('title')).trim(),
      video_url: normalizeLink(f.get('video_url')),
      content: String(f.get('content'))
    };
    if (!row.title) throw new Error('Dars nomini kiriting.');
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
    <FormModal title={l ? 'Darsni tahrirlash' : 'Yangi dars'} submitLabel={l ? 'Saqlash' : 'Qo‘shish'} onSubmit={onSubmit} onClose={onClose}>
      <CourseSelect value={l?.course_id || courseId} disabled={!!l} />
      <label className="field">Dars nomi<input name="title" required maxLength={200} defaultValue={l?.title || ''} /></label>
      <label className="field">Video yoki havola (YouTube, Telegram — ixtiyoriy)
        <input name="video_url" type="text" inputMode="url" defaultValue={l?.video_url || ''} placeholder="https://youtu.be/... yoki https://t.me/kanal/12" />
        <span className="small muted">Telegram post havolasi (t.me/kanal/12) dars ichida ko‘rinadi. Kanal havolasi (t.me/kanal) tugma bo‘lib chiqadi.</span>
      </label>
      <label className="field">Dars matni<textarea name="content" style={{ minHeight: 180 }} defaultValue={l?.content || ''} /></label>
    </FormModal>
  );
}

export function AssignmentModal({ assignment: a, courseId, onClose }) {
  const { sb, reload, toast } = useMentor();

  async function onSubmit(f) {
    const due = f.get('due_at');
    const row = {
      title: String(f.get('title')).trim(),
      description: String(f.get('description')).trim(),
      due_at: due ? new Date(due).toISOString() : null,
      max_score: parseInt(f.get('max_score'), 10) || 5
    };
    if (!row.title) throw new Error('Topshiriq nomini kiriting.');
    const { error } = a
      ? await sb.from('assignments').update(row).eq('id', a.id)
      : await sb.from('assignments').insert({ ...row, course_id: f.get('course_id') });
    if (error) throw error;
    await reload();
    toast(a ? 'Topshiriq saqlandi' : 'Topshiriq berildi');
  }

  return (
    <FormModal title={a ? 'Topshiriqni tahrirlash' : 'Yangi topshiriq'} submitLabel={a ? 'Saqlash' : 'Topshiriq berish'} onSubmit={onSubmit} onClose={onClose}>
      <CourseSelect value={a?.course_id || courseId} disabled={!!a} />
      <label className="field">Nomi<input name="title" required maxLength={200} defaultValue={a?.title || ''} /></label>
      <label className="field">Shart<textarea name="description" defaultValue={a?.description || ''} /></label>
      <div className="row" style={{ alignItems: 'flex-end' }}>
        <label className="field" style={{ flex: '2 1 200px' }}>Muddat
          <input type="datetime-local" name="due_at" defaultValue={toLocalInput(a?.due_at)} />
        </label>
        <label className="field" style={{ flex: '1 1 120px' }}>Maksimal ball
          <input type="number" name="max_score" min={1} max={100} defaultValue={a?.max_score || 5} />
        </label>
      </div>
    </FormModal>
  );
}

export function GradeModal({ submission: s, onClose }) {
  const { sb, reload, toast, asg } = useMentor();
  const a = asg(s.assignment_id);

  async function onSubmit(f) {
    const score = parseInt(f.get('score'), 10);
    if (isNaN(score) || score < 0 || score > a.max_score) throw new Error(`Baho 0 dan ${a.max_score} gacha bo‘lsin.`);
    const { error } = await sb.from('submissions')
      .update({ score, feedback: String(f.get('feedback')).trim() || null })
      .eq('id', s.id);
    if (error) throw error;
    await reload();
    toast('Baho saqlandi');
  }

  return (
    <FormModal title="Baholash" submitLabel="Bahoni saqlash" onSubmit={onSubmit} onClose={onClose}>
      <p className="small muted">{s.student?.full_name} · {a?.title} · {fmtDate(s.submitted_at)}</p>
      <div className="lesson-body" style={{ background: 'var(--bg)', padding: 14, borderRadius: 12, maxHeight: 280, overflow: 'auto' }}>
        {s.content}
      </div>
      <label className="field">Baho (0–{a.max_score})
        <input type="number" name="score" min={0} max={a.max_score} required defaultValue={s.score ?? ''} />
      </label>
      <label className="field">Izoh (o‘quvchi ko‘radi)<textarea name="feedback" defaultValue={s.feedback || ''} /></label>
    </FormModal>
  );
}

// Kurs arizasiga javob: qabul / rad. Javob matni ixtiyoriy.
export function ReplyModal({ app: a, status, onClose }) {
  const { sb, loadApps, toast } = useMentor();
  const accept = status === 'accepted';

  async function onSubmit(f) {
    const { data, error } = await sb.from('applications')
      .update({ status, reply: String(f.get('reply') || '').trim() || null })
      .eq('id', a.id).select('id');
    if (error) throw error;
    await loadApps();
    if (!data?.length) throw new Error('Bu arizaga boshqa mentor allaqachon javob bergan.');
    toast(accept ? 'Ariza qabul qilindi' : 'Ariza rad etildi');
  }

  return (
    <FormModal
      title={accept ? 'Arizani qabul qilish' : 'Arizani rad etish'}
      submitLabel={accept ? 'Qabul qilish' : 'Rad etish'}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <p className="small muted">
        <b>{a.student?.full_name || 'O‘quvchi'}</b> · {a.subject}<br />Bo‘sh vaqti: {a.free_time || '—'}
      </p>
      <label className="field">
        {accept ? 'Qachon o‘tib bera olasiz? (ixtiyoriy)' : 'Sabab (ixtiyoriy)'}
        <textarea
          name="reply"
          maxLength={2000}
          defaultValue={a.reply || ''}
          placeholder={accept ? 'Masalan: Seshanba va payshanba 18:00 da, Telegram: @mening_kanalim' : 'Masalan: Hozir bu vaqtda bo‘sh emasman'}
        />
      </label>
    </FormModal>
  );
}
