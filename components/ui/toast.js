'use client';
import { useEffect } from 'react';
import { toastSI } from '../../core/toasts';
import '../../styles/components/toast.css';
import '../../styles/components/close.css';

// Toast: shows the site's toasts (core/toasts.js: a plain object that draws them itself) while it's mounted. Renders
// nothing; add one with toastSI.add(msg, tone) from anywhere.
/**
 * @param {Object} props
 * @param {string} [props.title] - Each toast's heading. @param {number} [props.max] - How many to keep.
 */
const Toast = ({ title, max }) => {
  useEffect(() => {
    toastSI.mount(document.body, { title, max });
    return () => toastSI.unmount();
  }, [ title, max ]);
  return null;
}

export { Toast };
