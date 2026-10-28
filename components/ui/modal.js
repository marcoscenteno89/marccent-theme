'use client';
import { useRef, useEffect, useId } from 'react';
import { cx } from '../../lib/cx';
import { Button } from './button';
import '../../styles/components/modal.css';

/**
 * ModalPanel: what a modal shows, without the <dialog>, in one of two looks (styles/components/modal.css):
 *  - default: a bordered box, the title and a ✕ on top, then the body and the buttons at the end, lines between.
 *  - "ticket" (the old client's PopUp): a band in the theme gradient with the title (centered, a size larger),
 *    a notch cut into each side,
 *    then the body and the buttons centered. No ✕: Close, Esc or the backdrop close it.
 * Modal wraps it in a <dialog>; on its own (inside a .modal element for the box) it previews a modal in a page.
 * @param {string} title @param {string} [titleId] - id for the title, so the dialog can point to it.
 * @param {Function} onClose @param {React.ReactNode} [footer] - Extra buttons, before Close.
 * @param {"ticket"} [variant] - The look; default when left out.
 */
const ModalPanel = ({ title, titleId, onClose, footer, variant, children }) => {
  const close = <Button icon="xmark" className={variant === 'ticket' ? 'gradient' : undefined} onClick={onClose}>Close</Button>;
  if (variant === 'ticket') return (
    <div data-component="modal-panel" className="grid cols-1 gap-0">
      <div className="header pad bg-gradient text-center"><h4 id={titleId}>{title}</h4></div>
      <div className="modal-neck bg-gradient" />
      <div className="modal-flare bg" />
      <div className="bg pad-x grid cols-1">{children}</div>
      <div className="bg pad grid auto-cols cols-center gap-sm">{footer}{close}</div>
    </div>
  );
  return (
    <div data-component="modal-panel" className="grid cols-1 gap-0 divide">
      <div className="header pad">
        <h5 id={titleId}>{title}</h5>
        <Button icon="xmark" aria-label="Close" onClick={onClose} />
      </div>
      <div className="pad grid cols-1">{children}</div>
      <div className="grid auto-cols items-center gap-sm pad" style={{ justifyContent: 'end' }}>{footer}{close}</div>
    </div>
  );
};

// Opens the <dialog> (as a modal: backdrop, focus kept inside, Esc closes it) while show is true.
const useDialog = (show) => {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (show && !dialog.open) dialog.showModal();
    if (!show && dialog.open) dialog.close();
  }, [show]);
  return ref;
};

/**
 * Modal: a native <dialog>, in either look (ModalPanel). The browser draws the backdrop, keeps focus inside and
 * closes it on Esc; a click on the backdrop closes it too. Both looks behave the same.
 * @param {string} title @param {boolean} show @param {Function} setShow - Called with false on close.
 * @param {React.ReactNode} [footer] - Extra buttons, before Close. @param {"ticket"} [variant] - The look.
 */
const Modal = ({ title, show, setShow, footer, variant, children }) => {
  const ref = useDialog(show);
  const titleId = useId();
  // The dialog has no padding, so a click whose target is the dialog itself landed on the backdrop.
  return (
    <dialog ref={ref} data-component="modal" className={cx('modal', variant)} aria-labelledby={titleId} onClose={() => setShow(false)}
      onClick={(e) => e.target === ref.current && setShow(false)}>
      <ModalPanel title={title} titleId={titleId} onClose={() => setShow(false)} footer={footer} variant={variant}>{children}</ModalPanel>
    </dialog>
  );
}

/**
 * Drawer: Modal's <dialog> as a panel sliding in from the side (off-canvas: a phone menu, filters, a cart), full
 * height, --drawer-width wide. The title and a ✕ on top, then the body (it scrolls when long), the footer at the
 * bottom. Esc, the ✕ or the backdrop close it.
 * @param {string} title @param {boolean} show @param {Function} setShow - Called with false on close.
 * @param {"end"|"start"} [side='end'] - The screen's side it comes from.
 * @param {React.ReactNode} [footer] - Buttons along the bottom.
 * @example <Drawer title="Menu" show={open} setShow={setOpen} side="start"><Menu items={main} label="Main" layout="cols-1" /></Drawer>
 */
const Drawer = ({ title, show, setShow, side = 'end', footer, className, children }) => {
  const ref = useDialog(show);
  const titleId = useId();
  return (
    <dialog ref={ref} data-component="drawer" data-side={side} className={cx('modal drawer', className)} aria-labelledby={titleId}
      onClose={() => setShow(false)} onClick={(e) => e.target === ref.current && setShow(false)}>
      <div className="grid cols-1 gap-0 divide h-100" style={{ gridTemplateRows: 'auto minmax(0, 1fr)', gridAutoRows: 'auto' }}>
        <div className="header pad">
          <h5 id={titleId}>{title}</h5>
          <Button icon="xmark" aria-label="Close" onClick={() => setShow(false)} />
        </div>
        <div className="pad grid cols-1 content-start overflow-auto">{children}</div>
        {footer && <div className="pad grid auto-cols items-center gap-sm">{footer}</div>}
      </div>
    </dialog>
  );
};

export { Modal, ModalPanel, Drawer };
