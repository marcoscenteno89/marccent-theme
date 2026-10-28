'use client';
import { cloneElement, useEffect, useId, useRef } from 'react';
import { cx } from '../../lib/cx';
import { keepPlaced } from '../../core/place';
import { tooltip } from '../../core/tooltip';
import '../../styles/components/popover.css';

/*
 * Floating boxes beside an element: Tooltip (a hint on hover or focus), LinkPreview (a card over a link) and Popover
 * (a panel a button opens). Each is a native popover: in the top layer, so no overflow or stacking context clips
 * it, placed beside its trigger by place() (core/place.js) and kept there as the page scrolls. The trigger is the
 * one child, any element that passes on an id (a Button, a next/link Link, a plain tag); it keeps its own id. The
 * markup is the contract the plain-JS engine reads too (core/components.js): the trigger's aria-describedby or
 * popovertarget names the box, whose data-placement is the side.
 */

/**
 * Tooltip: a short hint over its child while the pointer is on it or it has keyboard focus; Esc hides it. The child
 * points to it (aria-describedby), so screen readers read it after the child's name. Touch has no hover: a tap that
 * focuses the child shows it.
 * interactive: the box stays while the pointer moves into it (LinkPreview's card), and takes the card look.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.content - What it says.
 * @param {'top'|'bottom'|'left'|'right'} [props.side='top'] - Where it goes; the other side when there's no room.
 * @param {number} [props.delay=150] - Milliseconds on the trigger before it shows.
 * @param {boolean} [props.interactive] - See above.
 * @param {string} [props.className] - Extra classes on the box.
 * @param {React.ReactElement} props.children - The trigger.
 *
 * @example <Tooltip content="Copy the link"><Button icon="link" aria-label="Copy link" /></Tooltip>
 */
const Tooltip = ({ content, side = 'top', delay = 150, interactive = false, className, children }) => {
  const id = useId();
  const anchorId = children.props.id ?? `${id}-anchor`;
  const box = useRef(null);

  // The behavior is plain JavaScript (core/tooltip.js), shared with the markup engine.
  useEffect(() => {
    const trigger = document.getElementById(anchorId);
    return trigger ? tooltip(box.current, trigger, { side, delay, interactive }) : undefined;
  }, [ anchorId, side, delay, interactive ]);

  // No title: the browser's own tooltip would show on top of this one.
  const trigger = cloneElement(children, {
    id: anchorId,
    title: undefined,
    'aria-describedby': cx(children.props['aria-describedby'], id),
  });
  return (
    <>
      {trigger}
      <div ref={box} id={id} role="tooltip" popover="manual" data-component="tooltip" data-placement={side}
        className={cx('float', interactive ? 'tooltip-card bg border round shadow' : 'tooltip', className)}>
        {content}
      </div>
    </>
  );
};

/**
 * LinkPreview: a link that shows a card about where it goes (an image, a title, a line) while hovered or focused, a
 * Wikipedia-style preview. The card is yours to fill: the image is a screenshot or an og:image you have, nothing is
 * fetched. Built on Tooltip (interactive).
 *
 * @param {Object} props
 * @param {React.ReactElement} props.children - The link (a next/link Link or an <a>).
 * @param {string} [props.image] - The picture at the top. @param {string} props.title @param {string} [props.text]
 * @param {'top'|'bottom'|'left'|'right'} [props.side='top']
 *
 * @example <LinkPreview title="Marccent" text="Themes, animations and tools." image="/img/og.png"><Link href="https://marccent.com">marccent.com</Link></LinkPreview>
 */
const LinkPreview = ({ image, title, text, side = 'top', children }) => (
  <Tooltip interactive side={side} delay={300} content={
    <div className="grid cols-1 gap-0">
      {image && <img src={image} alt="" className="link-preview-image" />}
      <div className="grid cols-1 gap-sm pad-sm">
        <strong>{title}</strong>
        {text && <span className="fs-sm opacity-75">{text}</span>}
      </div>
    </div>
  }>{children}</Tooltip>
);

/**
 * Popover: a panel its child (a button) opens and closes, beside it. The browser closes it on a click outside, on Esc
 * and on the button again, and puts it next in the tab order after the button. For menus of actions, filters, a
 * small form. ToggleButton's panel is the same idea fixed under a toggle; this one takes any button and side.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.content - The panel.
 * @param {string} props.label - The panel's name for screen readers.
 * @param {'top'|'bottom'|'left'|'right'} [props.side='bottom']
 * @param {string} [props.className] - Classes for the panel (default look: bg border round shadow pad-sm).
 * @param {React.ReactElement} props.children - The button (it must render a <button>: popovertarget needs one).
 *
 * @example <Popover label="Filters" content={<Filters />}><Button icon="filter">Filters</Button></Popover>
 */
const Popover = ({ content, label, side = 'bottom', className = 'bg border round shadow pad-sm', children }) => {
  const id = useId();
  const anchorId = children.props.id ?? `${id}-anchor`;
  const box = useRef(null);

  // The button opens it as its popovertarget, not with a click handler, so a click on it isn't a click outside
  // (which would close it and open it again).
  useEffect(() => {
    const el = box.current;
    const button = document.getElementById(anchorId);
    if (button && 'popoverTargetElement' in button) {
      button.popoverTargetElement = el;
    }
    return keepPlaced(el, () => document.getElementById(anchorId), side);
  }, [ anchorId, side ]);

  return (
    <>
      {cloneElement(children, { id: anchorId, popovertarget: id })}
      <div ref={box} id={id} popover="auto" role="group" aria-label={label} data-component="popover" data-placement={side} className={cx('float popover', className)}>
        {content}
      </div>
    </>
  );
};

export { Tooltip, LinkPreview, Popover };
