'use client';
import { useState, useEffect, useId, useRef } from 'react';
import { cx } from '../../lib/cx';
import { useMedia } from '../../lib/media';
import { ButtonIcon } from './button';
import { ToggleButton } from './toggle-button';

// Below this the content doesn't fit beside the icon: it pops out in a panel instead (the sm step, layout.css).
const NARROW = '(width < 40rem)';

// Whether its content fits in its row, tried for real: the button widened at once to the content's width, with no
// transition, the row's items (some may shrink to make room, like the mini editor's palette slider) must all stay
// inside the row. Then back as it was.
const fits = (el, width) => {
  const row = el.parentElement;
  const box = row.getBoundingClientRect();
  const pad = getComputedStyle(row);
  const start = box.left + parseFloat(pad.paddingLeft);
  const end = box.right - parseFloat(pad.paddingRight);

  el.style.transition = 'none';
  el.style.maxWidth = 'none';
  el.style.width = `${width}px`;
  const items = [ ...row.children ].map((child) => child.getBoundingClientRect()).filter((item) => item.width);
  const first = Math.min(...items.map((item) => item.left));
  const last = Math.max(...items.map((item) => item.right));
  el.style.width = '';
  el.style.maxWidth = '';
  el.offsetWidth; // the resting width applies before the transition comes back, so it doesn't animate
  el.style.transition = '';
  return first >= start - 1 && last <= end + 1; // a row packed at the end spills out of its start instead
};

// The content's full width (fit-content would squeeze it to what a grid track offers): the width it opens to.
const measure = (el) => {
  el.style.transition = 'none';
  el.style.width = 'max-content';
  const width = el.offsetWidth;
  el.style.width = '';
  el.offsetWidth;
  el.style.transition = '';
  return width;
};

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
  const need = useRef(0);

  // Wide screens: check the room whenever the row changes size. The content's width is measured while it's the
  // wide button (the first render always is) and kept for when it's the toggle, whose content is in the panel.
  useEffect(() => {
    if (narrow) {
      return;
    }
    const row = document.getElementById(id)?.parentElement;
    if (!row) {
      return;
    }
    const check = () => {
      const el = document.getElementById(id);
      if (!el) {
        return;
      }
      if (el.matches('[role="group"]') && !el.matches(':hover, :focus-within')) {
        need.current = measure(el);
        el.style.setProperty('--open-width', `${need.current}px`);
      }
      if (need.current) {
        setCramped(!fits(el, need.current));
      }
    };
    const watch = new ResizeObserver(check);
    watch.observe(row);
    return () => watch.disconnect();
  }, [ narrow, id ]);

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
