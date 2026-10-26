'use client';
import { useState, useEffect, useId } from 'react';
import { cx } from '../../lib/cx';
import { useMedia } from '../../lib/media';
import { ButtonIcon } from './button';
import { ToggleButton } from './toggle-button';

// Below this the content doesn't fit beside the icon: it pops out in a panel instead (the sm step, layout.css).
const NARROW = '(width < 40rem)';

/**
 * RowRoom: whether an ExpandButton's content fits in its row, kept up to date as the row changes size
 * (ResizeObserver). Tried for real, in one layout pass: the button widened at once (no transition) to its content's
 * width, the row's items (some may shrink to make room, like the mini editor's palette slider) must all stay inside
 * the row; then back as it was. The content's width is read while the button is the wide one (its first render always
 * is), set as its --open-width (hovers.css: fit-content would squeeze it to what a grid track offers) and kept for
 * when it's the toggle, whose content is in the panel. The button is found by id, as it's either element.
 */
class RowRoom {
  constructor(id) {
    this.id = id;
    this.need = 0;
  }

  // Calls onChange(fits) now and whenever the row's size changes.
  watch(onChange) {
    const row = document.getElementById(this.id)?.parentElement;
    if (!row) {
      return;
    }
    this.onChange = onChange;
    this.observer = new ResizeObserver(() => this.check());
    this.observer.observe(row);
  }

  stop() {
    this.observer?.disconnect();
    this.observer = null;
  }

  check() {
    const el = document.getElementById(this.id);
    // The wide one, at rest (not mid-opening): its content is there to measure.
    const wide = el?.matches('[role="group"]:not(:hover, :focus-within)');
    if (!el || (!wide && !this.need)) {
      return;
    }
    const { width, fits } = this.trial(el, wide ? 'max-content' : `${this.need}px`);
    if (wide) {
      this.need = width;
      el.style.setProperty('--open-width', `${width}px`);
    }
    this.onChange(fits);
  }

  // The button at that width for one layout: its width then, and whether the row still holds all its items.
  trial(el, width) {
    const row = el.parentElement;
    const box = row.getBoundingClientRect();
    const pad = getComputedStyle(row);
    const start = box.left + parseFloat(pad.paddingLeft);
    const end = box.right - parseFloat(pad.paddingRight);

    el.style.transition = 'none';
    el.style.maxWidth = 'none';
    el.style.width = width;
    const measured = el.offsetWidth;
    const items = [ ...row.children ].map((child) => child.getBoundingClientRect()).filter((item) => item.width);
    el.style.width = '';
    el.style.maxWidth = '';
    el.offsetWidth; // the resting width applies before the transition comes back, so it doesn't animate
    el.style.transition = '';

    // A row packed at the end spills out of its start instead.
    const fits = items.every((item) => item.left >= start - 1 && item.right <= end + 1);
    return { width: measured, fits };
  }
}

/**
 * ExpandButton: an icon button that opens into whatever you put in it: a select, a few links, a search field…
 * Room in its row: it widens in place on hover (hover-expand, styles/hovers.css) and stays open while something in
 * it has focus (:focus-within). A div, not a <button>, so the content can be controls of its own.
 * No room (it watches its row), or a narrow screen (below 40rem): like the nav's menu toggle, a ToggleButton
 * (icon → xmark, the close) with the content as its panel, in front of the page under the button, at most 70vw wide
 * and 60vh tall (.toggle-panel, button.css); a tap outside, Esc or the button closes it.
 * Give it a label (its name and tooltip), since the content only shows when open. For tight rows (the mini editor's
 * design style).
 *
 * @param {{ icon: string, label: string, className?: string, children: React.ReactNode, [attr: string]: any }} props
 *   icon: as Button's. label: what it is, for its tooltip and screen readers. Any other prop goes on the div (wide)
 *   or the button (narrow).
 * @example <ExpandButton icon="swatchbook" label="Design Style"><select …>…</select></ExpandButton>
 */
const ExpandButton = ({ icon, label, className, children, ...rest }) => {
  const narrow = useMedia(NARROW);
  const [ cramped, setCramped ] = useState(false);
  const id = useId();
  const [ room ] = useState(() => new RowRoom(id));

  // Wide screens: switch to the toggle whenever the row has no room (RowRoom, above).
  useEffect(() => {
    if (narrow) {
      return;
    }
    room.watch((fits) => setCramped(!fits));
    return () => room.stop();
  }, [ narrow, room ]);

  if (narrow || cramped) {
    return <ToggleButton data-component="expand-button" id={id} icon={icon} activeIcon="xmark" panel={children} className={className} title={label} aria-label={label} {...rest} />;
  }
  return (
    <div data-component="expand-button" id={id} role="group" aria-label={label} title={label} className={cx('btn hover-expand', className)} {...rest}>
      <ButtonIcon icon={icon} />
      <span className="btn-text">{children}</span>
    </div>
  );
};

export { ExpandButton };
