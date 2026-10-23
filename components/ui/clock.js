'use client';
import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { watchInView } from '../../lib/in-view';
import '../../styles/components/clock.css';

/**
 * LiveClock: writes the time into a <time> element every second while it's on screen. format is a dayjs format
 * string. destroy() stops it.
 */
class LiveClock {
  constructor(el, format) {
    this.el = el;
    this.format = format;
    this.stopWatching = watchInView(el, (inView) => (inView ? this.start() : this.stop()));
  }
  tick = () => {
    const time = dayjs();
    this.el.dateTime = time.toISOString();
    this.el.textContent = time.format(this.format);
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

// Live clock (LiveClock). Empty until it runs in the browser: a time rendered on the server would already be a
// second off when the page hydrates.
const Clock = ({ format = 'h:mm:ss A', className = '' }) => {
  const ref = useRef(null);
  useEffect(() => {
    const clock = new LiveClock(ref.current, format);
    return () => clock.destroy();
  }, [ format ]);
  return <time ref={ref} className={className}>{' '}</time>;
}

export { Clock, LiveClock };
