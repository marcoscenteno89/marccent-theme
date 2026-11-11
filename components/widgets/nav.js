'use client';
import { useState, useRef, useId, Children, cloneElement } from 'react';
import { Link } from '../../lib/link';
import { cx } from '../../lib/cx';
import { Icon } from '../ui/icon';
import { Tooltip } from '../ui/popover';
import { useToggle } from '../ui/toggle-button';
import '../../styles/components/button.css';
import '../../styles/components/dock.css';

/*
 * Navigation widgets: a radial menu, a step bar of chevrons, a tab bar with a sliding indicator and a dock. Mostly no
 * CSS of their own: grid, stack, shape and color classes, and inline styles for positions and motion; the dock's
 * magnifying needs sibling selectors (dock.css). Each takes its items as children (RadialMenuItem, StepBarStep, Tab,
 * DockItem: PRODUCT-LINE.md 6.1), and hands each one its place and state.
 */

const ease = 'var(--duration-slow) cubic-bezier(.34, 1.56, .64, 1)'; // a little overshoot
const itemSize = '3rem'; // a radial menu item's width

/**
 * RadialMenu: one round button that opens a ring of items around itself (a speed dial). Esc or the button closes it.
 * @param {React.ReactNode} children - Its RadialMenuItems (or a Loop of them), clockwise from the top.
 * @param {string} [radius='5rem'] - How far the items fan out.
 * @param {string} [label='Quick menu'] - The button's name (aria-expanded says whether it's open).
 * @example <RadialMenu label="Contact us"><RadialMenuItem icon="phone" label="Call" href="tel:+12085550100" /></RadialMenu>
 */
const RadialMenu = ({ radius = '5rem', label = 'Quick menu', className, children }) => {
  const ring = useId();
  const { on: open, set: setOpen, flip, attrs } = useToggle({ controls: ring }); // Esc closes it
  const items = Children.toArray(children);
  return (
    <div id={ring} data-component="radial-menu" className={cx('stack', className)} style={{ width: `calc(${radius} * 2 + ${itemSize})`, aspectRatio: 1, placeItems: 'center' }}>
      {items.map((item, i) => cloneElement(item, { angle: i * 360 / items.length - 90, radius, open, delay: i * 40, onClose: () => setOpen(false) }))}
      {/* Its own round button, not a .btn (the design styles restyle those); the plus turns into an x as it opens. */}
      <button data-component="button" data-name="toggle" type="button" className="circle bg-gradient col-center shadow" {...attrs} aria-label={label} onClick={flip}
        style={{ width: `calc(${itemSize} * 1.25)`, aspectRatio: 1, padding: 0, border: 0, color: 'var(--light)', cursor: 'pointer',
          rotate: open ? '135deg' : '0deg', transition: `rotate ${ease}` }}>
        <Icon name="plus" className="fs-lg" />
      </button>
    </div>
  );
}

/**
 * RadialMenuItem: one of a RadialMenu's items, a round icon link or button; its RadialMenu places it on the ring.
 * @param {string} icon @param {string} label - Its name (aria-label and title).
 * @param {string} [href] - A link; otherwise a button calling onClick. Either way, the menu closes.
 * @param {Function} [onClick]
 */
const RadialMenuItem = ({ icon, label, href, onClick, angle = -90, radius = '5rem', open = false, delay = 0, onClose }) => {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag data-component="radial-menu-item" href={href} type={href ? undefined : 'button'} aria-label={label} title={label}
      tabIndex={open ? 0 : -1} aria-hidden={!open}
      onClick={(e) => { onClick?.(e); onClose?.(); }}
      className="circle border bg col-center"
      style={{ width: itemSize, aspectRatio: 1, padding: 0, color: 'inherit', cursor: 'pointer',
        transform: open ? `rotate(${angle}deg) translate(${radius}) rotate(${-angle}deg)` : 'none',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: `transform ${ease} ${delay}ms, opacity var(--duration) ${delay}ms, scale var(--hover-duration)` }}>
      <Icon name={icon} />
    </Tag>
  );
}

const point = 'polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)'; // the first step: a flat start, the chevron's point

/**
 * StepBar: steps as chevrons chained into one bar, each nested in the next. Done steps are filled, the current one
 * takes the gradient, the rest are a neutral. Columns are a quarter of a chevron; each spans four and the next starts
 * three later, so the point of one fills the notch of the next. Labels drop to numbers on phones (.icon-only-sm).
 * @param {React.ReactNode} children - Its StepBarSteps (or a Loop of them), in order.
 * @param {number} [start=0] - The current step at first.
 * @param {Function} [onChange] - (index) when a step is clicked.
 * @example <StepBar start={1}><StepBarStep label="Order" /><StepBarStep label="Pay" /></StepBar>
 */
const StepBar = ({ start = 0, onChange, className, children }) => {
  const [ current, setCurrent ] = useState(start);
  const steps = Children.toArray(children);
  return (
    <nav data-component="step-bar" aria-label="Steps" className={cx('grid fixed gap-0', className)} style={{ '--cols': steps.length * 3 + 1, columnGap: '.2rem' }}>
      {steps.map((step, i) => cloneElement(step, { index: i, current, onSelect: () => { setCurrent(i); onChange?.(i); } }))}
    </nav>
  );
}

/**
 * StepBarStep: one of a StepBar's steps, a chevron with its number (a check once done) and its label.
 * @param {string} label
 */
const StepBarStep = ({ label, index = 0, current = 0, onSelect }) => (
  <button data-component="step-bar-step" data-name={label} type="button" aria-current={index === current ? 'step' : undefined} onClick={onSelect}
    className={cx('center gap-sm icon-only-sm', index > 0 && 'shape-chevron-right', index < current && 'bg-primary', index === current && 'bg-gradient')}
    style={{ gridRow: 1, gridColumn: `${index * 3 + 1} / span 4`, aspectRatio: 'auto', minHeight: '3rem', border: 0,
      color: index > current ? 'inherit' : 'var(--light)', cursor: 'pointer', paddingInline: '25%', clipPath: index === 0 ? point : undefined,
      // Steps to come: an opaque neutral (a see-through fill would show the overlaps).
      ...(index > current && { backgroundColor: 'color-mix(in srgb, var(--body-color) 14%, var(--surface))' }) }}>
    <strong>{index < current ? <Icon name="check" /> : index + 1}</strong>
    <span className="btn-text text-truncate">{label}</span>
  </button>
);

/**
 * TabBar: tabs over a panel, a gradient bar sliding under the picked tab. Arrow keys move between tabs.
 * @param {React.ReactNode} children - Its Tabs (or a Loop of them): each one's label and icon make its tab, its
 *   content the panel.
 * @example <TabBar><Tab label="Overview" icon="house"><p>One.</p></Tab><Tab label="Billing">…</Tab></TabBar>
 */
const TabBar = ({ className, children }) => {
  const [ active, setActive ] = useState(0);
  const list = useRef(null);
  const tabs = Children.toArray(children);
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
          {tabs.map(({ props: { label, icon } }, i) => (
            <button data-component="button" data-name={label} key={label} type="button" role="tab" aria-selected={i === active} tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)} className={cx('btn-plain center gap-sm pad-sm icon-only-sm', i === active ? 'text-primary fw-bold' : 'opacity-75')}>
              {icon && <Icon name={icon} />}<span className="btn-text">{label}</span>
            </button>
          ))}
        </div>
        <div className="bg-gradient" aria-hidden="true" style={{ height: '3px', width: `${100 / tabs.length}%`,
          translate: `${active * 100}% 0`, transition: `translate ${ease}`, borderRadius: '3px' }} />
      </div>
      {tabs[active]}
    </div>
  );
}

/**
 * Tab: one of a TabBar's tabs: its label and icon go on the tab, its content is the panel while it's picked.
 * @param {string} label @param {string} [icon] @param {React.ReactNode} children - The panel.
 */
// label and icon: its TabBar reads them for the tab; the Tab is its panel.
const Tab = ({ label, icon, children }) => <div data-component="tab" role="tabpanel" className="pad-sm">{children}</div>;

/**
 * Dock: a row of round icon buttons that swell as the pointer passes, the one under it most and its neighbors a
 * little (macOS style; CSS only, dock.css). Each item's name shows in a Tooltip above it and is its accessible name.
 * Keyboard focus swells an item too. Reduced motion: no swelling.
 * @param {React.ReactNode} children - Its DockItems (or a Loop of them).
 * @param {string} [label='Dock'] - The nav's aria-label.
 *
 * @example <Dock><DockItem icon="house" label="Home" href="/" /><DockItem icon="fa-brands fa-github" label="GitHub" href={gh} external /></Dock>
 */
const Dock = ({ label = 'Dock', className, children }) => (
  <nav data-component="dock" aria-label={label} className={cx('d-grid w-max justify-self-center pad-xs bg border pill shadow', className)}>
    <ul className="dock-items list-plain d-grid auto-cols items-end gap-xs">{children}</ul>
  </nav>
);

/**
 * DockItem: one of a Dock's items.
 * @param {string} icon - A Button icon ("house", or full "fa-…" classes). @param {string} label - Its name.
 * @param {string} [href] - A link; otherwise a button calling onClick. @param {Function} [onClick]
 * @param {boolean} [external] - Opens in a new tab.
 */
const DockItem = ({ icon, label, href, onClick, external }) => {
  const glyph = icon.startsWith('fa-') ? <Icon family={false} className={icon} /> : <Icon name={icon} />;
  const props = { className: 'dock-item btn-plain bg-muted circle col-center', 'aria-label': label };
  return (
    <li data-component="dock-item">
      <Tooltip content={label}>
        {href
          ? <Link href={href} {...props} {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>{glyph}</Link>
          : <button type="button" onClick={onClick} {...props}>{glyph}</button>}
      </Tooltip>
    </li>
  );
};

export { RadialMenu, RadialMenuItem, StepBar, StepBarStep, TabBar, Tab, Dock, DockItem };
