'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isToday from 'dayjs/plugin/isToday';
import relativeTime from 'dayjs/plugin/relativeTime';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import localeData from 'dayjs/plugin/localeData';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import minMax from 'dayjs/plugin/minMax';
import { cx } from '../../lib/cx';
import { Button } from './button';
import '../../styles/components/calendar.css';

[ weekOfYear, isoWeek, isBetween, isSameOrBefore, isSameOrAfter, isToday, relativeTime, advancedFormat, localeData,
  dayOfYear, isLeapYear, minMax ].forEach((plugin) => dayjs.extend(plugin));

/*
 * Calendar: a month of days to pick from, with year and decade views (the title zooms out), events as dots, limits and
 * a line under it saying what's picked. All date work is dayjs's; the look is calendar.css, the states in the markup
 * (aria-selected, aria-current, disabled, .is-end, .is-outside). Empty until it runs in the browser: the visitor's
 * today may not be the server's.
 */

const KEY = 'YYYY-MM-DD';

/**
 * @param {Object} props
 * @param {'single'|'range'} [props.mode='single'] - Pick one day, or a start and an end (the second pick; hovering
 *   previews the range).
 * @param {Function} [props.onChange] - (dayjs) in single mode, ([start, end]) in range mode.
 * @param {{ date: string, title: string, color?: string }[]} [props.events] - date: anything dayjs reads (a time shows
 *   in the details); color: a bg-* class for its dot (default bg-secondary).
 * @param {string} [props.minimum] @param {string} [props.maximum] - Days outside them can't be picked ("2026-11-01").
 * @param {0|1} [props.weekStart=0] - The week's first day: 0 Sunday (weeks numbered by weekOfYear), 1 Monday (ISO).
 * @param {boolean} [props.weekNumbers] - A column of week numbers.
 * @param {Function} [props.disable] - (dayjs) → true for a day that can't be picked (fully booked).
 * @param {boolean} [props.details=true] - The line under it saying what's picked; false when the parent says it.
 * @param {string} [props.className]
 * Keyboard: arrows move a day or a week, Page Up / Down a month (with Shift a year), Home / End the week's ends, Enter
 * or Space picks.
 */
const Calendar = ({ mode = 'single', onChange, events = [], minimum, maximum, weekStart = 0, weekNumbers, disable, details = true, className }) => {
  const [ today, setToday ] = useState(null);
  const [ cursor, setCursor ] = useState(null); // the focused day; its month is the one shown
  const [ view, setView ] = useState('month'); // month → year → decade (zooming out), back in by picking
  const [ picked, setPicked ] = useState(mode === 'range' ? [ null, null ] : null);
  const [ hover, setHover ] = useState(null);
  const grid = useRef(null);
  const focus = useRef(false); // move the browser's focus with the cursor only after a key press

  useEffect(() => { const t = dayjs().startOf('day'); setToday(t); setCursor(t); }, []);
  useEffect(() => {
    if (!focus.current || !cursor) return;
    grid.current?.querySelector(`[data-date="${cursor.format(KEY)}"]`)?.focus();
    focus.current = false;
  }, [ cursor ]);

  const byDay = useMemo(() => events.reduce((all, e) => {
    const d = dayjs(e.date);
    (all[d.format(KEY)] ??= []).push({ ...e, at: d });
    return all;
  }, {}), [ events ]);

  const root = cx('calendar bg border round shadow pad grid cols-1 gap-sm', className);
  if (!today) return <div data-component="calendar" className={root} />;

  const lo = minimum && dayjs(minimum).startOf('day'), hi = maximum && dayjs(maximum).startOf('day');
  const allowed = (d) => (!lo || d.isSameOrAfter(lo, 'day')) && (!hi || d.isSameOrBefore(hi, 'day')) && !disable?.(d);
  const clamp = (d) => dayjs.max(lo || d, dayjs.min(hi || d, d));

  // The month: 6 weeks from the week holding the 1st, so every month is as tall.
  const first = cursor.startOf('month');
  const start = first.subtract((first.day() - weekStart + 7) % 7, 'day');
  const days = Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
  const names = dayjs.weekdaysMin();
  const header = Array.from({ length: 7 }, (_, i) => names[(i + weekStart) % 7]);
  const weekNo = (d) => (weekStart === 1 ? d.isoWeek() : d.week());

  // Range: the picked ends, or the start and the hovered day as a preview.
  const [ a, b ] = mode === 'range' ? [ picked[0], picked[1] ?? (picked[0] && hover) ] : [ picked, null ];
  const from = a && b ? dayjs.min(a, b) : a, to = a && b ? dayjs.max(a, b) : a;
  const isEnd = (d) => !!((from && d.isSame(from, 'day')) || (to && d.isSame(to, 'day')));
  const inRange = (d) => !!(from && to && d.isBetween(from, to, 'day', '()'));

  const pick = (d) => {
    if (!allowed(d)) return;
    setCursor(d);
    if (mode === 'single') { setPicked(d); onChange?.(d); return; }
    const [ s, e ] = picked;
    const next = !s || e ? [ d, null ] : [ dayjs.min(s, d), dayjs.max(s, d) ];
    setPicked(next);
    if (next[1]) onChange?.(next);
  };

  const key = (e) => {
    const moves = {
      ArrowLeft: () => cursor.subtract(1, 'day'), ArrowRight: () => cursor.add(1, 'day'),
      ArrowUp: () => cursor.subtract(1, 'week'), ArrowDown: () => cursor.add(1, 'week'),
      PageUp: () => cursor.subtract(1, e.shiftKey ? 'year' : 'month'), PageDown: () => cursor.add(1, e.shiftKey ? 'year' : 'month'),
      Home: () => cursor.subtract((cursor.day() - weekStart + 7) % 7, 'day'),
      End: () => cursor.add(6 - (cursor.day() - weekStart + 7) % 7, 'day'),
    };
    if (moves[e.key]) { e.preventDefault(); focus.current = true; setCursor(clamp(moves[e.key]())); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(cursor); }
  };

  const step = { month: [ 1, 'month' ], year: [ 1, 'year' ], decade: [ 10, 'year' ] }[view];
  const decadeStart = cursor.year() - cursor.year() % 10;
  const title = { month: cursor.format('MMM YYYY'), year: cursor.format('YYYY'), decade: `${decadeStart} – ${decadeStart + 9}` }[view];
  const unit = view === 'decade' ? 'ten years' : view;

  return (
    <div data-component="calendar" className={root}>
      <div className="header">
        <button type="button" className="calendar-title" onClick={() => setView(view === 'month' ? 'year' : 'decade')}
          disabled={view === 'decade'} aria-label={`${title}${view !== 'decade' ? ', zoom out' : ''}`}>
          <span className="text-gradient">{title}</span>
        </button>
        <Button icon="chevron-left" aria-label={`Previous ${unit}`} onClick={() => setCursor(clamp(cursor.subtract(...step)))} />
        <Button icon="chevron-right" aria-label={`Next ${unit}`} onClick={() => setCursor(clamp(cursor.add(...step)))} />
        <Button icon="calendar-day" className="outline-primary" aria-label="Today" title="Today" onClick={() => { setCursor(today); setView('month'); }} />
      </div>

      {view === 'month' && (
        <div ref={grid} role="grid" aria-label={cursor.format('MMMM YYYY')} className="calendar-month" style={{ '--cols': weekNumbers ? 8 : 7 }} onKeyDown={key}>
          <div role="row" className="calendar-row">
            {weekNumbers && <small className="calendar-head" aria-hidden="true">Wk</small>}
            {header.map((n) => <small key={n} className="calendar-head" role="columnheader">{n}</small>)}
          </div>
          {Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7)).map((week) => (
            <div key={week[0].format(KEY)} role="row" className="calendar-row">
              {weekNumbers && <small className="calendar-head" role="rowheader" aria-label={`Week ${weekNo(week[0])}`}>{weekNo(week[0])}</small>}
              {week.map((d) => {
                const k = d.format(KEY), list = byDay[k] ?? [];
                return (
                  <button type="button" key={k} data-date={k} role="gridcell" tabIndex={d.isSame(cursor, 'day') ? 0 : -1}
                    aria-selected={isEnd(d) || inRange(d)} aria-current={d.isToday() ? 'date' : undefined} disabled={!allowed(d)}
                    aria-label={`${d.format('D MMMM YYYY, dddd')}${list.length ? `, ${list.length} event${list.length > 1 ? 's' : ''}` : ''}`}
                    onClick={() => pick(d)} onMouseEnter={() => mode === 'range' && setHover(d)} onFocus={() => setCursor(d)}
                    className={cx('calendar-day', isEnd(d) && 'is-end', d.month() !== cursor.month() && 'is-outside')}>
                    <span>{d.date()}</span>
                    <span className="calendar-dots" aria-hidden="true">
                      {list.slice(0, 3).map((ev, j) => <i key={j} className={cx('calendar-dot', ev.color ?? 'bg-secondary')} />)}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {view === 'year' && (
        <div className="calendar-cells">
          {Array.from({ length: 12 }, (_, m) => cursor.month(m).startOf('month')).map((m) => {
            const count = Object.keys(byDay).filter((k) => dayjs(k).isSame(m, 'month')).reduce((n, k) => n + byDay[k].length, 0);
            return (
              <button key={m.month()} type="button" onClick={() => { setCursor(clamp(m.date(Math.min(cursor.date(), m.daysInMonth())))); setView('month'); }}
                className={cx('calendar-cell', m.isSame(cursor, 'month') && 'is-end')} aria-current={m.isSame(today, 'month') ? 'date' : undefined}>
                {m.format('MMM')}
                <small>{count ? `${count} event${count > 1 ? 's' : ''}` : '—'}</small>
              </button>
            );
          })}
        </div>
      )}

      {view === 'decade' && (
        <div className="calendar-cells">
          {Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i).map((y) => {
            const d = cursor.year(y);
            return (
              <button key={y} type="button" onClick={() => { setCursor(clamp(d)); setView('year'); }}
                className={cx('calendar-cell', y === cursor.year() && 'is-end', (y < decadeStart || y > decadeStart + 9) && 'is-outside')}
                aria-current={y === today.year() ? 'date' : undefined}>
                {y}
                <small>{d.isLeapYear() ? 'Leap year' : `${d.endOf('year').dayOfYear()} days`}</small>
              </button>
            );
          })}
        </div>
      )}

      {details && <Details mode={mode} picked={picked} today={today} byDay={byDay} weekNo={weekNo} />}
    </div>
  );
};

// What's picked, in words: the day, how far from today, its week and day of the year and its events; for a range, its
// ends, length and the events inside it.
const Details = ({ mode, picked, today, byDay, weekNo }) => {
  const from = (d) => (d.isSame(today, 'day') ? 'today' : d.from(today));
  const eventsIn = (s, e) => Object.entries(byDay).filter(([ k ]) => dayjs(k).isBetween(s, e, 'day', '[]'))
    .flatMap(([ , list ]) => list).sort((x, y) => x.at.valueOf() - y.at.valueOf());
  let body;
  if (mode === 'single') {
    body = !picked ? <small className="opacity-75">Pick a day.</small> : (
      <>
        <strong>{picked.format('dddd, MMMM Do, YYYY')}</strong>
        <small className="opacity-75">{from(picked)} · week {weekNo(picked)} · day {picked.dayOfYear()} of {picked.endOf('year').dayOfYear()}</small>
        <EventList list={eventsIn(picked, picked)} />
      </>
    );
  } else {
    const [ s, e ] = picked;
    const n = s && e ? e.diff(s, 'day') + 1 : 0;
    body = !s ? <small className="opacity-75">Pick a start day, then an end day.</small>
      : !e ? <small className="opacity-75">From {s.format('MMM Do')}: now pick an end day.</small> : (
        <>
          <strong>{s.format('MMM Do')} – {e.format('MMM Do, YYYY')}</strong>
          <small className="opacity-75">{n} day{n > 1 ? 's' : ''} · starts {from(s)} · {n > 7 ? `${Math.ceil(n / 7)} weeks` : 'within a week'}</small>
          <EventList list={eventsIn(s, e)} />
        </>
      );
  }
  return <div className="grid cols-1 gap-0 pad-y-sm" aria-live="polite">{body}</div>;
};

const EventList = ({ list }) => !list.length ? null : (
  <ul className="grid cols-1 gap-sm pad-y-sm">
    {list.map((ev, i) => (
      <li key={i} className="grid auto-cols gap-sm items-center">
        <i className={cx('calendar-dot calendar-dot-lg', ev.color ?? 'bg-secondary')} />
        <span>{ev.title}</span>
        <small className="opacity-75">{ev.at.format(ev.at.hour() || ev.at.minute() ? 'ddd D · h:mm A' : 'ddd D')}</small>
      </li>
    ))}
  </ul>
);

export { Calendar };
