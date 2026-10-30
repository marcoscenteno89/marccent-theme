'use client';
import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { useInView } from '../../lib/in-view';
import { toastSI } from '../../lib/toasts';
import { Button } from './button';
import { CodeView, dedent, copyCode, MONO } from '../../core/code-view';

/*
 * Code: a read-only code block on CodeMirror 6, highlighted in the theme's colors, with a copy button. CodeMirror only
 * loads (its own chunk) the first time a block comes near the screen; until then, and without JavaScript, the plain
 * code shows in a <pre> of the same size, so nothing jumps when it swaps in. The markup is the contract the plain-JS
 * engine reads too (core/components.js): data-lang, the <pre>, a [data-code-host] and a [data-copy] button.
 */

/**
 * @param {Object} props
 * @param {string} props.children - The code (indentation is trimmed, see dedent).
 * @param {'js'|'jsx'|'css'|'html'|'sh'} [props.lang='jsx']
 * @param {string} [props.className] - Extra classes on the box.
 */
const Code = ({ children, lang = 'jsx', className }) => {
  const code = dedent(children);
  const box = useRef(null);
  const host = useRef(null);
  const near = useInView(box, '200px');
  const [ seen, setSeen ] = useState(false);
  const [ ready, setReady ] = useState(false);

  useEffect(() => { if (near) setSeen(true); }, [ near ]);
  useEffect(() => {
    if (!seen || !host.current) return;
    const view = new CodeView(host.current, code, lang);
    view.mount().then(() => !view.destroyed && setReady(true));
    return () => view.destroy();
  }, [ seen, code, lang ]);

  const copy = () => copyCode(code, toastSI);

  // .stack: the code and the copy button in one cell, the button over the top-right corner.
  return (
    <div ref={box} data-component="code" data-lang={lang} className={cx('stack bg border round', className)}>
      {!ready && (
        // tabIndex: a box that scrolls sideways needs the keyboard too.
        <pre tabIndex={0} className="fs-sm overflow-auto" style={{ margin: 0, padding: 'var(--space-sm)', fontFamily: MONO, lineHeight: 'var(--line-height)' }}>
          <code>{code}</code>
        </pre>
      )}
      <div ref={host} data-code-host className="overflow-hidden" />
      <Button icon="copy" aria-label="Copy code" title="Copy" data-copy onClick={copy}
        style={{ placeSelf: 'start end', margin: 'var(--space-xs)' }} />
    </div>
  );
};

export { Code, CodeView };
