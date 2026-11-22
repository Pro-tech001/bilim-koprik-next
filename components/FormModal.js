'use client';
import { useEffect, useRef, useState } from 'react';
import { errText } from '@/lib/utils';
import { useT } from '@/lib/i18n';

// Universal forma oynasi: onSubmit(FormData) xato tashlasa — oynada ko'rsatiladi.
export default function FormModal({ title, children, submitLabel, onSubmit, onClose, cancelLabel }) {
  const t = useT();
  const ref = useRef(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await onSubmit(new FormData(e.currentTarget));
      onClose();
    } catch (x) {
      setErr(errText(x));
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onClose(); }}>
      <form className="modal" onSubmit={submit}>
        <h2>{title}</h2>
        {children}
        {err && <div className="msg err" role="alert">{err}</div>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn secondary" onClick={onClose}>{cancelLabel || t('Bekor qilish')}</button>
          {submitLabel && <button className="btn" type="submit" disabled={busy}>{busy ? t('Saqlanmoqda...') : submitLabel}</button>}
        </div>
      </form>
    </dialog>
  );
}
