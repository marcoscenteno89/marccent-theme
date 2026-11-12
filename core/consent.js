/**
 * watchConsent: cookie consent (Consent: components/ui/consent.js, its markup). The box shows until the visitor
 * answers; the answer is kept six months in the marccent_consent cookie (yes / no). On yes, the tags a site held back
 * (<template data-consent-held>, inert until then) run; Google's Consent Mode is told either way when the page has
 * gtag (gtag('consent', 'update', …)), and a marccent:consent event (detail: true / false) goes out on the document.
 * A link to #cookie-settings anywhere opens it again. Returns a function that stops.
 * @param {HTMLElement} box - [data-component="consent"], its buttons [data-consent="yes"] and [data-consent="no"].
 * @returns {() => void}
 */
const COOKIE = 'marccent_consent';
const STORAGE = [ 'ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage' ];

const answered = () => document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=(yes|no)`))?.[1];

// The held tags, run: each script made anew (a script cloned from a template doesn't run).
const release = () => document.querySelectorAll('template[data-consent-held]').forEach((t) => {
  const fragment = t.content.cloneNode(true);
  fragment.querySelectorAll('script').forEach((old) => {
    const s = document.createElement('script');
    for (const a of old.attributes) s.setAttribute(a.name, a.value);
    s.text = old.text;
    old.replaceWith(s);
  });
  t.replaceWith(fragment);
});

const tell = (yes) => {
  window.gtag?.('consent', 'update', Object.fromEntries(STORAGE.map((k) => [ k, yes ? 'granted' : 'denied' ])));
  document.dispatchEvent(new CustomEvent('marccent:consent', { detail: yes }));
};

const watchConsent = (box) => {
  const answer = (yes) => {
    const secure = location.protocol === 'https:' ? ';Secure' : '';
    document.cookie = `${COOKIE}=${yes ? 'yes' : 'no'};path=/;max-age=15552000;SameSite=Lax${secure}`;
    tell(yes);
    if (yes) release();
    box.hidden = true;
  };
  const onBox = (e) => {
    const b = e.target.closest('[data-consent]');
    if (b) answer(b.dataset.consent === 'yes');
  };
  const onLink = (e) => {
    if (!e.target.closest('a[href$="#cookie-settings"]')) return;
    e.preventDefault();
    box.hidden = false;
    box.querySelector('[data-consent="yes"]')?.focus();
  };
  box.addEventListener('click', onBox);
  document.addEventListener('click', onLink);
  const now = answered();
  if (now === 'yes') release();
  box.hidden = Boolean(now);
  return () => {
    box.removeEventListener('click', onBox);
    document.removeEventListener('click', onLink);
  };
};

export { watchConsent };
