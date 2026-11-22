'use client';
import FormModal from '@/components/FormModal';
import { fmtDate } from '@/lib/utils';
import { useStudent } from './StudentProvider';
import { useT } from '@/lib/i18n';

export default function SubmitModal({ assignment: a, onClose }) {
  const { subs, me, sb, reload, toast } = useStudent();
  const s = subs.get(a.id);
  const graded = s && s.score != null;
  const t = useT();

  async function onSubmit(f) {
    const content = String(f.get('content') || '').trim();
    if (!content) throw new Error(t('Javob bo‘sh bo‘lmasin.'));
    const { error } = s
      ? await sb.from('submissions').update({ content }).eq('id', s.id)
      : await sb.from('submissions').insert({ assignment_id: a.id, student_id: me.id, content });
    if (error) throw error;
    await reload();
    toast('Topshiriq yuborildi');
  }

  return (
    <FormModal
      title={a.title}
      onClose={onClose}
      onSubmit={onSubmit}
      cancelLabel={t('Yopish')}
      submitLabel={graded ? null : s ? t('Javobni yangilash') : t('Topshirish')}
    >
      <p className="small muted">{t('Muddat')}: {fmtDate(a.due_at)} · {t('Maksimal ball')}: {a.max_score}</p>
      <div className="lesson-body" style={{ background: 'var(--bg)', padding: 14, borderRadius: 12 }}>
        {a.description || t('Shart yozilmagan')}
      </div>
      {graded && (
        <div className="msg ok">
          <b>{t('Baho')}: {s.score}/{a.max_score}</b>
          {s.feedback && <><br />{t('Mentor izohi')}: {s.feedback}</>}
        </div>
      )}
      <label className="field">{t('Javobingiz')}
        <textarea
          name="content"
          readOnly={graded}
          required={!graded}
          defaultValue={s?.content || ''}
          placeholder={t('Javobingizni yozing yoki havola (Google Drive va h.k.) qo‘ying')}
        />
      </label>
    </FormModal>
  );
}
