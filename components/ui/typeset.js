'use client';
import { Children, Fragment } from 'react';
import { typesetParts } from '../../core/typeset';

/*
 * Typeset: its text set the way print sets it (core/typeset.js: … – — ™ ® ℠ ©, raised ordinals, primes, m², a number
 * and its unit kept together). The plain-JS twin for server-written markup is data-component="typeset".
 */

const render = (text, options) => typesetParts(text, options).map((p, i) => (typeof p === 'string'
  ? <Fragment key={i}>{p}</Fragment>
  : <sup key={i} className={p.className}>{p.sup}</sup>));

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Its text: the strings among the children are set (not those inside
 *   other elements: give those their own Typeset).
 * @param {string|React.ElementType} [props.as='span'] - The element: p, h2, li…
 * @param {boolean} [props.widow] - Keep the last two words together (default: for a p or a heading).
 *
 * @example <Typeset as="p">Open Mon--Fri, 2nd floor. Marccent(tm)...</Typeset>
 */
const Typeset = ({ as: Tag = 'span', children, widow, ...rest }) => {
  const keepLast = widow ?? (typeof Tag === 'string' && /^(p|h[1-6]|li|dd|figcaption|blockquote)$/.test(Tag));
  const list = Children.toArray(children);
  return (
    <Tag {...rest}>
      {list.map((c, i) => (typeof c === 'string' ? <Fragment key={i}>{render(c, { widow: keepLast && i === list.length - 1 })}</Fragment> : c))}
    </Tag>
  );
};

export { Typeset };
