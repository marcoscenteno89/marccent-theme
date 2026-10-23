'use client';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useToasts } from '../../lib/toasts';
import { Icon } from './icon';
import '../../styles/components/toast.css';
import '../../styles/components/close.css';

// Toast types with a color (defaults.css): toast.add(msg, 'success') fills it like <Alert tone="success">.
const TONES = ['primary', 'secondary', 'success', 'danger', 'info'];
dayjs.extend(relativeTime);

const Toast = () => {
  const toast = useToasts();
  const [counter, setCounter] = useState(0); // a re-render a minute keeps the "x minutes ago" current

  useEffect(() => {
    const interval = setInterval(() => setCounter((prev) => prev + 1), 60000); 
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      {/* Toasts: a grid stack in the bottom-right corner, newest last.
          Layout in styles/components/toast.css, colors in colors.css, fade-in in animations.css. */}
      <div className="toasts position-fixed bottom-0 end-0 pad">
        {toast.list.map((item, i) => (
          <div key={`${+item.time}-${item.msg}`} className="toast round shadow"
            role="alert" aria-live="assertive" aria-atomic="true"
            style={TONES.includes(item.type) ? { backgroundColor: `var(--${item.type}-mode)`, color: `var(--${item.type}-mode-text)` } : undefined}>
            <div className="header pad">
              <strong>Marccent</strong>
              <small>{dayjs(item.time).fromNow()}</small>
              <button type="button" className="btn-close col-center" aria-label="Close" onClick={() => toast.remove(i)}><Icon name="xmark" /></button>
            </div>
            <div className="pad">{item.msg}</div>
          </div>
        ))}
      </div>
    </>
  )
}

export { Toast };
