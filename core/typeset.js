/*
 * TYPESET: plain text set the way print sets it, so authors type what's on their keyboard:
 *   ...  → …                                  1st, 2nd, 3rd, 4th → the letters raised
 *   10--20, Mon--Fri → 10–20, Mon–Fri (ranges)  word -- word → word—word (a break)
 *   6'2" → 6′2″ (primes, after a number)        m2, ft3 after a number → m², ft³
 *   (tm) (r) (sm) (c) → ™ ® ℠ ©                 ™ ® ℠ raised small (sup.mark-sup)
 *   a number and its unit (10 kg, 72 °F, 50 %) never split across lines (a no-break space)
 *   with widow: the last two words of a paragraph kept on one line
 * Hyphens are left alone (phone numbers, dates and codes use them). typesetParts() is the rules, as plain strings and
 * { sup, className } parts; Typeset (components/ui/typeset.js) renders them in React, typesetElement() in the page
 * (the markup engine's data-component="typeset": every text in it but code, pre, kbd, samp, script, style,
 * textarea and .no-typeset).
 */

const NBSP = '\u00A0';
// The units a number keeps beside it. After a no-break space or none (50%, 72°F stay as written).
const UNITS = [ 'kg', 'g', 'mg', 'lbs?', 'oz', 'km', 'm', 'cm', 'mm', 'mi', 'ft', 'in', 'yd', 'ac', 'ha', 'L', 'ml',
  'gal', '°F', '°C', '°', '%', 'hrs?', 'min', 'sec', 'mph', 'km/h', 'kWh', 'kW', 'W', 'V', 'psi', 'sq ft', 'sq m' ];
const LENGTHS = 'mm|cm|km|m|ft|in|yd|mi';
const POWERS = { 2: '²', 3: '³' };
const MARKS = { '(tm)': '™', '(r)': '®', '(sm)': '℠', '(c)': '©' };

// The text with its characters replaced: everything that needs no element.
const characters = (text) => text
  .replace(/\.\.\./g, '…')
  .replace(/(\d) ?-- ?(?=\d)/g, '$1–')
  .replace(/(\S)--(?=\S)/g, '$1–')
  .replace(/ ?-- ?/g, '—')
  .replace(/\((tm|r|sm|c)\)/gi, (m) => MARKS[m.toLowerCase()])
  .replace(/(\d)'(\d{1,2})"/g, '$1′$2″')
  .replace(/(\d)"(?![\p{L}\d])/gu, '$1″')
  .replace(/(\d)'(?![\p{L}\d])/gu, '$1′')
  .replace(new RegExp(`(\\d[\\d,.]*) ?(${ LENGTHS })([23])(?![\\p{L}\\d])`, 'gu'), (m, n, unit, p) => `${ n }${ NBSP }${ unit }${ POWERS[p] }`)
  .replace(new RegExp(`(\\d) (?=(?:${ UNITS.join('|') })(?![\\p{L}\\d]))`, 'gu'), `$1${ NBSP }`);

// The last space before a short last word, a no-break one.
const noWidow = (text) => text.replace(/ (\S{1,12}\s*)$/u, `${ NBSP }$1`);

/**
 * typesetParts: the text set, as parts: strings, and { sup, className } for raised text (an ordinal's letters, ™).
 * @param {string} text @param {{ widow?: boolean }} [options] - widow: keep the last two words together.
 * @returns {Array<string | { sup: string, className?: string }>}
 */
const typesetParts = (text, { widow = false } = {}) => {
  let set = characters(text);
  if (widow) set = noWidow(set);
  const parts = [];
  // Ordinals (after a whole number) and marks (™ ® ℠, not ©, which sits on the line).
  const raised = /(\d)(st|nd|rd|th)(?![\p{L}\d])|([™®℠])/gu;
  let at = 0;
  for (const m of set.matchAll(raised)) {
    const start = m.index + (m[1] ? 1 : 0);
    if (start > at) parts.push(set.slice(at, start));
    parts.push(m[2] ? { sup: m[2] } : { sup: m[3], className: 'mark-sup' });
    at = m.index + m[0].length;
  }
  if (at < set.length) parts.push(set.slice(at));
  return parts;
};

const SKIP = 'code, pre, kbd, samp, script, style, textarea, sup, sub, .no-typeset, [contenteditable]';

/**
 * typesetElement: sets the text inside el (typesetParts), in place. Its last text, the paragraph's end, keeps its last
 * two words together. Run once on markup a server wrote; the markup engine runs it on data-component="typeset".
 * @param {HTMLElement} el
 */
const typesetElement = (el) => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((node, i) => {
    const parts = typesetParts(node.data, { widow: i === texts.length - 1 });
    if (parts.length === 1 && parts[0] === node.data) return;
    node.replaceWith(...parts.map((p) => {
      if (typeof p === 'string') return p;
      const sup = document.createElement('sup');
      sup.textContent = p.sup;
      if (p.className) sup.className = p.className;
      return sup;
    }));
  });
};

export { typesetParts, typesetElement };
