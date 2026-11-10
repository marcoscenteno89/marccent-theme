'use client';
import { useRef, useEffect, useState } from 'react';
import { Icon } from './icon';
import { Button } from './button';
import { cx } from '../../lib/cx';

// Splits milliseconds into the zero-padded parts Counter shows and reports (tos = hundredths).
const pad = (n) => String(n).padStart(2, '0');
const splitTime = (ms) => ({
  hour: pad(Math.floor(ms / 3600000)),
  minute: pad(Math.floor(ms / 60000) % 60),
  second: pad(Math.floor(ms / 1000) % 60),
  tos: pad(Math.floor(ms / 10) % 100),
});
const format = (t) => `${t.hour}:${t.minute}:${t.second}.${t.tos}`;

/**
 * Stopwatch: writes the elapsed time into el. start() starts from zero; stop() stops, resets el to zero and
 * returns the time ({ hour, minute, second, tos }, zero-padded strings), or null if it wasn't running.
 * Time is read from the clock (Date.now) instead of counting ticks, so it stays exact when the browser slows
 * timers (background tabs).
 */
class Stopwatch {
  constructor(el) {
    this.el = el;
    this.started = null;
  }
  show(ms) { this.el.textContent = format(splitTime(ms)); }
  start() {
    this.stop();
    this.started = Date.now();
    this.show(0);
    this.interval = setInterval(() => this.show(Date.now() - this.started), 50);
  }
  stop() {
    clearInterval(this.interval);
    if (this.started === null) return null;
    const time = splitTime(Date.now() - this.started);
    this.started = null;
    this.show(0);
    return time;
  }
  destroy() { clearInterval(this.interval); }
}

/**
 * Counter: a Stopwatch that runs while active is true. When active turns false it reports the time to getTime
 * and resets to zero. With controls, it's a stopwatch of its own: a Start / Stop button beside it, and the last
 * time stopped after it (the WordPress Stopwatch block).
 * @param {boolean} [active] - Runs while true; false stops it, reports the time and resets it (without controls).
 * @param {(time: { hour: string, minute: string, second: string, tos: string }) => void} [getTime] - Called with the
 *   time when it stops.
 * @param {boolean} [controls] - Its own Start / Stop button and the last time.
 * @param {string} [className] - Extra classes.
 */
const Counter = ({ active, getTime, controls, className }) => {
  const [ running, setRunning ] = useState(false);
  const [ last, setLast ] = useState(null);
  if (controls) {
    return (
      <div data-component="stopwatch" className={cx('grid auto-cols items-center gap-sm', className)}>
        <Button icon={running ? 'stop' : 'play'} className={running ? 'danger' : 'primary'} onClick={() => setRunning(!running)}>{running ? 'Stop' : 'Start'}</Button>
        <Count active={running} getTime={(t) => { setLast(t); getTime?.(t); }} />
        {last && <small className="opacity-75">Last: {format(last)}</small>}
      </div>
    );
  }
  return <Count active={active} getTime={getTime} className={className} />;
};

// The count itself: a Stopwatch in a <small>, running while active.
const Count = ({ active, getTime, className }) => {
  const ref = useRef(null);
  const watch = useRef(null);
  useEffect(() => {
    watch.current = new Stopwatch(ref.current);
    return () => watch.current.destroy(); // no timer leaks on unmount
  }, []);
  useEffect(() => {
    if (active) return watch.current.start();
    const time = watch.current.stop();
    if (time) getTime?.(time);
  }, [ active ]);
  return (
    <small data-component="counter" className={cx('nums-tabular text-nowrap', className)}>
      <Icon name="stopwatch" /> <span ref={ref}>{format(splitTime(0))}</span>
    </small>
  );
};

export { Counter, Stopwatch };
