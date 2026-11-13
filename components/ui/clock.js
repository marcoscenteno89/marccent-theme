'use client';
import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { cx } from '../../lib/cx';
import { watchInView } from '../../lib/in-view';
import { GooDigit } from '../visuals/effects';
import '../../styles/components/clock.css';

/**
 * LiveClock: shows the time on a Clock's element every second while it's on screen, by its face:
 * - digital: the time as text in the <time> element, in `format` (a dayjs format string);
 * - analog: the seconds since midnight in --clock-time, which turns the hands (clock.css); they only ever grow, so the
 *   second hand never spins back from 59 to 0;
 * - flip: each GooDigit's data-digit (hh mm ss; 24-hour when `format` has an H).
 * destroy() stops it.
 */
class LiveClock {
  constructor(el, format, face = 'digital') {
    this.el = el;
    this.format = format;
    this.face = face;
    this.stopWatching = watchInView(el, (inView) => (inView ? this.start() : this.stop()));
  }
  tick = () => {
    const time = dayjs();
    if (this.face === 'analog') {
      this.el.style.setProperty('--clock-time', time.hour() * 3600 + time.minute() * 60 + time.second());
      this.el.dataset.ticking = '';
      this.el.setAttribute('aria-label', time.format('h:mm A'));
    } else if (this.face === 'flip') {
      const digits = time.format(/H/.test(this.format) ? 'HHmmss' : 'hhmmss');
      this.el.querySelectorAll('.countdown').forEach((d, i) => { d.dataset.digit = digits[i]; });
      this.el.setAttribute('aria-label', time.format(/H/.test(this.format) ? 'HH:mm:ss' : 'h:mm:ss A'));
    } else {
      this.el.dateTime = time.toISOString();
      this.el.textContent = time.format(this.format);
    }
  };
  start() {
    if (this.interval) return;
    this.tick();
    this.interval = setInterval(this.tick, 1000);
  }
  stop() {
    clearInterval(this.interval);
    this.interval = null;
  }
  destroy() {
    this.stop();
    this.stopWatching();
  }
}

// The analog face's 60 marks, every fifth an hour's (longer), the quarters in the primary color.
const MARKS = Array.from({ length: 60 }, (_, i) => (
  <line key={i} x1="50" x2="50" y1="5" y2={i % 5 ? 8 : 12} transform={`rotate(${i * 6} 50 50)`}
    className={i % 15 ? i % 5 ? 'clock-mark' : 'clock-mark clock-mark-hour' : 'clock-mark clock-mark-quarter'} />
));

// The flip face's colon: two dots.
const Colon = () => <span className="clock-flip-colon" aria-hidden="true"><i /><i /></span>;

/**
 * Clock: a live clock (LiveClock). Empty until it runs in the browser: a time rendered on the server would already be
 * a second off when the page hydrates.
 * @param {'digital'|'analog'|'flip'} [face='digital'] - digital: the time as text; analog: a face with hour marks and
 *   three hands; flip: hh:mm:ss in gooey digits that fold into the next. Analog and flip fill their parent's width
 *   (flip's digits are 3rem, --clock-flip-size, and smaller when the width is narrower).
 * @param {string} [format='h:mm:ss A'] - How the time reads, a dayjs format: "dddd, h:mm A", "HH:mm". Flip: 24-hour
 *   when it has an H.
 * @param {string} [className] - Extra classes on the root.
 */
const Clock = ({ face = 'digital', format = 'h:mm:ss A', className = '' }) => {
  const ref = useRef(null);
  useEffect(() => {
    const clock = new LiveClock(ref.current, format, face);
    return () => clock.destroy();
  }, [ format, face ]);
  if (face === 'analog') {
    return (
      <div ref={ref} data-component="clock" data-face="analog" className={cx('clock-analog', className)} role="img" aria-label="Clock">
        <svg className="clock-marks" viewBox="0 0 100 100" aria-hidden="true">{MARKS}</svg>
        <i className="clock-hand clock-hour" />
        <i className="clock-hand clock-minute" />
        <i className="clock-hand clock-second" />
        <i className="clock-pin" />
      </div>
    );
  }
  if (face === 'flip') {
    // Each digit's size is the pair's (clock.css), over the .countdown's own.
    const digit = <GooDigit digit={null} aria-hidden="true" style={{ '--countdown-size': 'inherit' }} />;
    const pair = () => <div className="clock-flip-pair">{digit}{digit}</div>;
    return (
      <div ref={ref} data-component="clock" data-face="flip" className={cx('clock-flip', className)} role="timer" aria-label="Clock">
        {pair()}<Colon />{pair()}<Colon />{pair()}
      </div>
    );
  }
  return <time ref={ref} data-component="clock" className={cx('nums-tabular text-nowrap', className)}>{' '}</time>;
}

export { Clock, LiveClock };
