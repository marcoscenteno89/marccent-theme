'use client';
import { useState, useRef, useId } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../ui/icon';
import { useToggle } from '../ui/toggle-button';
import '../../styles/components/button.css';

/*
 * Navigation widgets: a radial menu, a step bar of chevrons and a tab bar with a sliding indicator. No CSS of their
 * own: grid, stack, shape and color classes, and inline styles for positions and motion.
 */

const ease = 'var(--duration-slow) cubic-bezier(.34, 1.56, .64, 1)'; // a little overshoot

/**
 * RadialMenu: one round button that opens a ring of items around itself (a speed dial). Esc or the button closes it.
 * @param {{ icon: string, label: string, onClick?: Function, href?: string }[]} items
 * @param {string} [radius='5rem'] - How far the items fan out.
 * @param {string} [label='Quick menu'] - The button's name (aria-expanded says whether it's open).
 */
const RadialMenu = ({ items, radius = '5rem', label = 'Quick menu', className }) => {
  const ring = useId();
  const { on: open, set: setOpen, flip, attrs } = useToggle({ controls: ring }); // Esc closes it
  const size = '3rem';
  return (
    <div id={ring} data-component="radial-menu" className={cx('stack', className)} style={{ width: `calc(${radius} * 2 + ${size})`, aspectRatio: 1, placeItems: 'center' }}>
      {items.map((item, i) => {
        const angle = i * 360 / items.length - 90;
        const Tag = item.href ? 'a' : 'button';
        return (
          <Tag key={item.label} href={item.href} type={item.href ? undefined : 'button'} aria-label={item.label} title={item.label}
            tabIndex={open ? 0 : -1} aria-hidden={!open}
            onClick={(e) => { item.onClick?.(e); setOpen(false); }}
            className="circle border bg col-center"
            style={{ width: size, aspectRatio: 1, padding: 0, color: 'inherit', cursor: 'pointer',
              transform: open ? `rotate(${angle}deg) translate(${radius}) rotate(${-angle}deg)` : 'none',
              opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
              transition: `transform ${ease} ${i * 40}ms, opacity var(--duration) ${i * 40}ms, scale var(--hover-duration)` }}>
            <Icon name={item.icon} />
          </Tag>
        );
      })}
      {/* Its own round button, not a .btn (the design styles restyle those); the plus turns into an x as it opens. */}
      <button data-component="button" data-name="toggle" type="button" className="circle bg-gradient col-center shadow" {...attrs} aria-label={label} onClick={flip}
        style={{ width: `calc(${size} * 1.25)`, aspectRatio: 1, padding: 0, border: 0, color: 'var(--light)', cursor: 'pointer',
          rotate: open ? '135deg' : '0deg', transition: `rotate ${ease}` }}>
        <Icon name="plus" className="fs-lg" />
      </button>
    </div>
  );
}

/**
 * StepBar: steps as chevrons chained into one bar, each nested in the next. Done steps are filled, the current one
 * takes the gradient, the rest are a neutral. Columns are a quarter of a chevron; each spans four and the next starts
 * three later, so the point of one fills the notch of the next. Labels drop to numbers on phones (.icon-only-sm).
 * @param {string[]} steps @param {number} [start=0] - The current step at first.
 * @param {Function} [onChange] - (index) when a step is clicked.
 */
const StepBar = ({ steps, start = 0, onChange, className }) => {
  const [ current, setCurrent ] = useState(start);
  const go = (i) => { setCurrent(i); onChange?.(i); };
  const point = 'polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)'; // the first step: a flat start, the chevron's point
  return (
    <nav data-component="step-bar" aria-label="Steps" className={cx('grid fixed gap-0', className)} style={{ '--cols': steps.length * 3 + 1, columnGap: '.2rem' }}>
      {steps.map((step, i) => (
        <button data-component="button" data-name={step} key={step} type="button" aria-current={i === current ? 'step' : undefined} onClick={() => go(i)}
          className={cx('center gap-sm icon-only-sm', i > 0 && 'shape-chevron-right', i < current && 'bg-primary', i === current && 'bg-gradient')}
          style={{ gridRow: 1, gridColumn: `${i * 3 + 1} / span 4`, aspectRatio: 'auto', minHeight: '3rem', border: 0,
            color: i > current ? 'inherit' : 'var(--light)', cursor: 'pointer', paddingInline: '25%', clipPath: i === 0 ? point : undefined,
            // Steps to come: an opaque neutral (a see-through fill would show the overlaps).
            ...(i > current && { backgroundColor: 'color-mix(in srgb, var(--body-color) 14%, var(--surface))' }) }}>
          <strong>{i < current ? <Icon name="check" /> : i + 1}</strong>
          <span className="btn-text text-truncate">{step}</span>
        </button>
      ))}
    </nav>
  );
}

/**
 * TabBar: tabs over a panel, a gradient bar sliding under the picked tab. Arrow keys move between tabs.
 * @param {{ label: string, icon?: string, content: React.ReactNode }[]} tabs
 */
const TabBar = ({ tabs, className }) => {
  const [ active, setActive ] = useState(0);
  const list = useRef(null);
  const key = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    const next = (active + step + tabs.length) % tabs.length;
    setActive(next);
    list.current.children[next].focus();
  };
  return (
    <div data-component="tab-bar" className={cx('grid cols-1 gap-sm', className)}>
      <div className="grid cols-1 gap-0 border-bottom">
        <div ref={list} role="tablist" className="grid fixed gap-0" style={{ '--cols': tabs.length }} onKeyDown={key}>
          {tabs.map((t, i) => (
            <button data-component="button" data-name={t.label} key={t.label} type="button" role="tab" aria-selected={i === active} tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)} className={cx('center gap-sm pad-sm icon-only-sm', i === active ? 'text-primary fw-bold' : 'opacity-75')}
              style={{ border: 0, background: 'none', color: i === active ? undefined : 'inherit', cursor: 'pointer', transition: 'opacity var(--duration)' }}>
              {t.icon && <Icon name={t.icon} />}<span className="btn-text">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="bg-gradient" aria-hidden="true" style={{ height: '3px', width: `${100 / tabs.length}%`,
          translate: `${active * 100}% 0`, transition: `translate ${ease}`, borderRadius: '3px' }} />
      </div>
      <div role="tabpanel" className="pad-sm">{tabs[active].content}</div>
    </div>
  );
}

export { RadialMenu, StepBar, TabBar };
