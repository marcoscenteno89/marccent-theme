'use client';
import { useRef, useEffect } from 'react';
import { Icon } from './icon';
import { cx } from '../../lib/cx';
import '../../styles/components/clock.css';

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
 * and resets to zero.
 */
const Counter = ({ active, getTime, className }) => {
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
    <small data-component="counter" className={cx('timer', className)}>
      <Icon name="stopwatch" /> <span ref={ref}>{format(splitTime(0))}</span>
    </small>
  );
}

export { Counter, Stopwatch };
