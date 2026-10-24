'use client';
import { useState, useEffect } from 'react';
import { Button } from './button';

/**
 * ToggleButton: a Button with two states and an icon for each: icon while off, activeIcon while on (bars → xmark
 * for a nav). Any Button prop and class works on it (a color, hover-expand…).
 * Open or pressed: with controls (the id of what it opens: a nav, a menu) it's a disclosure (aria-expanded,
 * aria-controls) and Esc closes it; without, a pressed toggle (aria-pressed), unless activeLabel changes the label:
 * then the label says the state (Dark → Light) and a pressed state on top would contradict it. Its own state, or
 * yours: pass open (with onToggle) to drive it, or defaultOpen for where it starts.
 *
 * @param {Object} props
 * @param {string} props.icon - The icon while off (a Button icon: "bars", or full "fa-…" classes).
 * @param {string} props.activeIcon - The icon while on.
 * @param {string} [props.activeLabel] - The label while on (children while off): "Menu" → "Close".
 * @param {boolean} [props.open] - On or off, when you hold the state; leave it out for its own.
 * @param {boolean} [props.defaultOpen=false] - Where its own state starts.
 * @param {Function} [props.onToggle] - (on) each time it flips, by a click or Esc.
 * @param {string} [props.controls] - The id of the element it opens: makes it a disclosure.
 *
 * @example <ToggleButton icon="bars" activeIcon="xmark" activeLabel="Close" controls="site-nav" onToggle={setOpen}>Menu</ToggleButton>
 * @example <ToggleButton icon="fa-regular fa-heart" activeIcon="fa-solid fa-heart" className="hover-expand">Like</ToggleButton>
 */
const ToggleButton = ({ icon, activeIcon, activeLabel, open, defaultOpen = false, onToggle, controls, children, onClick, ...rest }) => {
  const [ own, setOwn ] = useState(defaultOpen);
  const on = open ?? own;
  const set = (next) => { if (open === undefined) setOwn(next); onToggle?.(next); };

  // A disclosure closes on Esc, like the nav or menu it opens.
  useEffect(() => {
    if (!controls || !on) return;
    const esc = (e) => e.key === 'Escape' && set(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [ controls, on ]);

  const state = controls ? { 'aria-expanded': on, 'aria-controls': controls } : !activeLabel && { 'aria-pressed': on };
  return (
    <Button icon={on ? activeIcon : icon} {...state} {...rest} onClick={(e) => { onClick?.(e); set(!on); }}>
      {on && activeLabel ? activeLabel : children}
    </Button>
  );
};

export { ToggleButton };
