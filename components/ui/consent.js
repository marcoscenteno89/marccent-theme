'use client';
import { useEffect, useRef } from 'react';
import { watchConsent } from '../../core/consent';
import '../../styles/components/consent.css';

/**
 * Consent: the cookie banner, a small panel in the bottom corner (across the bottom on phones) asking whether the site
 * may use cookies to measure. It stays until the visitor answers, and remembers the answer six months
 * (core/consent.js: the cookie, Google's Consent Mode, the tags a site held back in <template data-consent-held>).
 * A link to #cookie-settings opens it again. Server hosts write this markup; the engine wires it up.
 *
 * @param {Object} props
 * @param {string} [props.text] - The question.
 * @param {string} [props.accept='Accept'] - The yes button.
 * @param {string} [props.reject='No thanks'] - The no button.
 * @param {string} [props.policy] - The privacy policy's address: a link after the question.
 * @param {string} [props.label='Cookies'] - The panel's aria-label.
 *
 * @example <Consent policy="/privacy/" />
 */
const Consent = ({ text = 'We use cookies to see how the site is used and to measure our ads. Is that OK?', accept = 'Accept', reject = 'No thanks', policy, label = 'Cookies' }) => {
  const ref = useRef(null);
  useEffect(() => watchConsent(ref.current), []);
  return (
    <div ref={ref} data-component="consent" role="dialog" aria-label={label} hidden
      className="consent bg border round shadow pad grid cols-1 gap-sm">
      <p>{text}{policy && <> <a href={policy}>Privacy policy</a></>}</p>
      <div className="row-wrap cols-end gap-sm">
        <button type="button" className="btn" data-consent="no">{reject}</button>
        <button type="button" className="btn primary" data-consent="yes">{accept}</button>
      </div>
    </div>
  );
};

export { Consent };
