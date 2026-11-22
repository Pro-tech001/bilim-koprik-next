'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useT } from '@/lib/i18n';

const ToastCtx = createContext(() => {});

export function ToastProvider({ children }) {
  const [text, setText] = useState(null);
  const timer = useRef();
  const t = useT();
  const toast = useCallback((t, ms = 2800) => {
    setText(t);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setText(null), ms);
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {text && <div id="toast" role="status">{t(text)}</div>}
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
