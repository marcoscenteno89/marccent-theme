import { cx } from '../../lib/cx';

/*
 * DateTime: a date, a time or a range as <time> elements, written for the reader's language (Intl) and for machines
 * (each <time>'s datetime). A range shares what both ends share: "Nov 6 – 8, 2026", each end its own <time>. Relative
 * ("3 days ago", "in 2 hours") keeps the exact moment in its title. Made of plain elements and the theme's classes
 * only, so a server writes the same markup (its own clock for relative).
 */

const STYLES = {
  date: { dateStyle: 'medium' },
  'date-time': { dateStyle: 'medium', timeStyle: 'short' },
  time: { timeStyle: 'short' },
};
const UNITS = [ [ 'year', 31536000 ], [ 'month', 2592000 ], [ 'week', 604800 ], [ 'day', 86400 ], [ 'hour', 3600 ], [ 'minute', 60 ], [ 'second', 1 ] ];

// A date alone ("2026-11-06") is that day wherever it's read: read in UTC, shown in UTC.
const dateOnly = (iso) => /^\d{4}-\d{2}-\d{2}$/.test(iso);

const relative = (when, now, locale) => {
  const seconds = (when - now) / 1000;
  const [ unit, size ] = UNITS.find(([ , s ]) => Math.abs(seconds) >= s) ?? UNITS.at(-1);
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(Math.round(seconds / size), unit);
};

/**
 * @param {Object} props
 * @param {string} props.value - An ISO date or date and time: "2026-11-06", "2026-11-06T18:30:00-07:00".
 * @param {string} [props.end] - The range's end, the same way.
 * @param {"date"|"date-time"|"time"|"relative"} [props.show='date'] - What it shows; relative: from now ("3 days ago").
 * @param {string} [props.locale='en-US']
 * @param {string} [props.timeZone='UTC'] - An IANA zone ("America/Boise") for a date and time; a date alone is
 *   always its own day.
 * @param {string|number} [props.now] - Relative to this moment (a server's clock, a test); default the current one.
 * @param {string} [props.className]
 *
 * @example <DateTime value="2026-11-06" end="2026-11-08" />  // Nov 6 – 8, 2026
 * @example <DateTime value={post.date} show="relative" />     // 3 days ago
 */
const DateTime = ({ value, end, show = 'date', locale = 'en-US', timeZone = 'UTC', now, className }) => {
  const start = new Date(value);
  const zone = dateOnly(value) ? 'UTC' : timeZone;
  const format = new Intl.DateTimeFormat(locale, { ...(STYLES[show] ?? STYLES.date), timeZone: zone });
  if (show === 'relative') {
    return (
      <time data-component="date-time" dateTime={value} title={format.format(start)} className={className}>
        {relative(start, now != null ? new Date(now) : new Date(), locale)}
      </time>
    );
  }
  if (!end) return <time data-component="date-time" dateTime={value} className={className}>{format.format(start)}</time>;
  // A range: each end's own parts in its <time>, the parts both share around them.
  const out = [];
  for (const part of format.formatRangeToParts(start, new Date(end))) {
    const last = out.at(-1);
    if (last && last.source === part.source) last.text += part.value;
    else out.push({ source: part.source, text: part.value });
  }
  return (
    <span data-component="date-time" className={className}>
      {out.map((p, i) => p.source === 'shared' ? p.text
        : <time key={i} dateTime={p.source === 'startRange' ? value : end}>{p.text}</time>)}
    </span>
  );
};

export { DateTime };
