'use client';
import { cx } from '../../lib/cx';
import { useMedia } from '../../lib/media';
import { ButtonIcon } from './button';
import { ToggleButton } from './toggle-button';

// Below this the content doesn't fit beside the icon: it pops out in a panel instead (the sm step, layout.css).
const NARROW = '(width < 40rem)';

/**
 * ExpandButton: an icon button that opens into whatever you put in it: a select, a few links, a search field…
 * Wide screens: it widens in place on hover (hover-expand, styles/hovers.css) and stays open while something in it
 * has focus (:focus-within). A div, not a <button>, so the content can be controls of its own.
 * Narrow screens (below 40rem), like the nav's menu toggle: a ToggleButton (icon → xmark) with the content as its
 * panel, in front of the page under the button; a tap outside, Esc or the button closes it.
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

  if (narrow) return <ToggleButton data-component="expand-button" icon={icon} activeIcon="xmark" panel={children} className={className} title={label} aria-label={label} {...rest} />;
  return (
    <div data-component="expand-button" role="group" aria-label={label} title={label} className={cx('btn hover-expand', className)} {...rest}>
      <ButtonIcon icon={icon} />
      <span className="btn-text">{children}</span>
    </div>
  );
};

export { ExpandButton };
