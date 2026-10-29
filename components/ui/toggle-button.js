'use client';
import { useState, useEffect, useId, useRef } from 'react';
import { Button } from './button';
import '../../styles/components/button.css';

/**
 * useToggle: a toggle's behavior without its look, for a button of your own (RadialMenu's round one): on or off,
 * its own state or yours (open / defaultOpen / onToggle, as ToggleButton's), Esc closing a disclosure (controls),
 * and the attributes that say its state (aria-expanded + aria-controls, or aria-pressed; pressed: false for none).
 * @returns {{ on: boolean, set: (on: boolean) => void, flip: () => void, attrs: Object }} attrs: spread on the button.
 */
const useToggle = ({ open, defaultOpen = false, onToggle, controls, pressed = true, esc = true } = {}) => {
  const [ own, setOwn ] = useState(defaultOpen);
  const on = open ?? own;
  const set = (next) => { if (open === undefined) setOwn(next); onToggle?.(next); };
  const latest = useRef(set);
  latest.current = set;

  // A disclosure closes on Esc, like the nav or menu it opens.
  useEffect(() => {
    if (!controls || !esc || !on) return;
    const close = (e) => e.key === 'Escape' && latest.current(false);
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [ controls, esc, on ]);

  const attrs = controls ? { 'aria-expanded': on, 'aria-controls': controls } : pressed ? { 'aria-pressed': on } : {};
  return { on, set: (next) => latest.current(next), flip: () => latest.current(!on), attrs };
};

/**
 * ToggleButton: a Button with two states and an icon for each: icon while off, activeIcon while on (bars → xmark
 * for a nav; the same icon twice when only the fill shows it). Any Button prop and class works on it (a color,
 * hover-expand…). Its own state, or yours: pass open (with onToggle) to drive it, or defaultOpen for where it starts.
 * What it says it is:
 *  - panel: it opens that content itself, in a panel in front of the page under the button, like a phone menu.
 *    The panel is a popover: in the top layer, so no overflow or stacking clips it, and the browser closes it on a
 *    tap outside, on Esc or on the button. As big as its content, never wider than 70% of the screen nor taller than 60% of it or the room
 *    under the button (.toggle-panel, button.css), so there's always page left to tap.
 *  - controls (the id of what it opens: a nav, a menu): a disclosure (aria-expanded, aria-controls); Esc closes it.
 *  - neither: a pressed toggle (aria-pressed), unless activeLabel changes the label: then the label says the state
 *    (Dark → Light) and a pressed state on top would contradict it. An aria-pressed of your own wins (a pick-one
 *    button: Play → Playing, pressed while it's the one).
 *
 * @param {Object} props
 * @param {string} props.icon - The icon while off (a Button icon: "bars", or full "fa-…" classes).
 * @param {string} [props.activeIcon=icon] - The icon while on.
 * @param {string} [props.activeLabel] - The label while on (children while off): "Menu" → "Close".
 * @param {boolean} [props.open] - On or off, when you hold the state; leave it out for its own.
 * @param {boolean} [props.defaultOpen=false] - Where its own state starts.
 * @param {Function} [props.onToggle] - (on) each time it flips: a click, Esc, a tap outside its panel.
 * @param {string} [props.controls] - The id of the element it opens: makes it a disclosure.
 * @param {React.ReactNode} [props.panel] - Content it opens in a panel of its own (see above).
 * @param {React.ReactNode} [props.children] - Its label while off. @param {Function} [props.onClick] - Also called on a click.
 * @param {string} [props.className] - Extra classes. Any other prop (data-name, aria-*…) goes on its Button.
 *
 * @example <ToggleButton icon="bars" activeIcon="xmark" activeLabel="Close" controls="site-nav" onToggle={setOpen}>Menu</ToggleButton>
 * @example <ToggleButton icon="fa-regular fa-heart" activeIcon="fa-solid fa-heart" className="hover-expand">Like</ToggleButton>
 * @example <ToggleButton icon="share-nodes" activeIcon="xmark" aria-label="Share" panel={<ShareLinks />} />
 */
const ToggleButton = ({ icon, activeIcon = icon, activeLabel, open, defaultOpen = false, onToggle, controls, panel, children, onClick, ...rest }) => {
  const id = useId();
  const toggleId = rest.id ?? `${id}-toggle`; // yours when you give one (ExpandButton finds its button by it)
  const box = useRef(null);
  // A panel's popover closes itself on Esc; a changing label says the state itself (see above).
  const { on, set, flip, attrs } = useToggle({ open, defaultOpen, onToggle, controls: panel ? id : controls, pressed: !activeLabel, esc: !panel });

  // The panel: the button opens and closes it (popovertarget), not its own click, so a tap on it isn't a tap
  // outside, which would close the panel and open it again; found by id, since Button takes no ref. While open it
  // sits under the button, following it as the page scrolls. Placed before it shows (beforetoggle), so it never
  // flashes in the browser's default spot; focus moves in once it's shown (toggle). The state follows the popover,
  // whatever closed it.
  const hasPanel = !!panel;
  useEffect(() => {
    const el = box.current;
    if (!hasPanel || !el) return;
    const button = document.getElementById(toggleId);
    button.popoverTargetElement = el;
    const place = () => {
      const r = button.getBoundingClientRect();
      el.style.top = `${r.bottom + 8}px`;
      el.style.maxHeight = `min(60vh, calc(100dvh - ${r.bottom + 8}px - 1rem))`;
    };
    const opening = (e) => { if (e.newState === 'open') place(); set(e.newState === 'open'); };
    const shown = (e) => e.newState === 'open' && el.querySelector('select, input, textarea, button, a[href], [tabindex]')?.focus();
    el.addEventListener('beforetoggle', opening);
    el.addEventListener('toggle', shown);
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    return () => {
      el.removeEventListener('beforetoggle', opening);
      el.removeEventListener('toggle', shown);
      window.removeEventListener('scroll', place);
      window.removeEventListener('resize', place);
    };
  }, [ hasPanel, id, toggleId ]);
  // Your open (or defaultOpen) opens and closes the panel too.
  useEffect(() => {
    const el = box.current;
    if (hasPanel && el && el.matches(':popover-open') !== on) el.togglePopover(on);
  }, [ hasPanel, on ]);

  const button = (
    // data-icon / data-active-icon: both icons in the markup, so the plain-JS engine can swap them (core/components.js).
    <Button data-component="toggle-button" data-icon={icon} data-active-icon={activeIcon} icon={on ? activeIcon : icon} {...attrs} {...rest}
      {...(panel && { id: toggleId, popovertarget: id })}
      onClick={panel ? onClick : (e) => { onClick?.(e); flip(); }}>
      {on && activeLabel ? activeLabel : children}
    </Button>
  );
  if (!panel) return button;
  return (
    <>
      {button}
      <div ref={box} id={id} data-component="toggle-panel" popover="auto" role="group" aria-label={rest['aria-label'] ?? (typeof children === 'string' ? children : undefined)}
        className="toggle-panel bg border round shadow pad-sm">
        {panel}
      </div>
    </>
  );
};

export { ToggleButton, useToggle };
