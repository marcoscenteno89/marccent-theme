'use client';
import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { useInView } from '../../lib/in-view';
import { toastSI } from '../../lib/toasts';
import { Button } from './button';
import { CodeView, dedent, copyCode, MONO, FORMATS } from '../../core/code-view';

/*
 * Code: a code block on CodeMirror 6, read-only or (with onChange) an editor for an admin's code field, highlighted
 * in the theme's colors, with a copy button (read-only: an editor's would sit on its text). CodeMirror only
 * loads (its own chunk) the first time a block comes near the screen; until then, and without JavaScript, the plain
 * code shows in a <pre> of the same size, so nothing jumps when it swaps in. The markup is the contract the plain-JS
 * engine reads too (core/components.js): data-lang, the <pre>, a [data-code-host] and a [data-copy] button. An editor
 * lays out code saved crammed on long lines as it opens, and has a Format button ([data-format], Shift+Alt+F) under it.
 */

/**
 * @param {Object} props
 * @param {string} props.children - The code (indentation is trimmed, see dedent; not while editing).
 * @param {'js'|'jsx'|'css'|'html'|'sh'} [props.lang='jsx']
 * @param {(code: string) => void} [props.onChange] - Makes it an editor: called with the code on every edit; children
 *   is then its value (a change from outside replaces the text).
 * @param {string} [props.label] - The editor's accessible name (default "Code (lang)").
 * @param {number} [props.minLines=4] - Editing: the height it keeps while nearly empty, in lines.
 * @param {string} [props.className] - Extra classes on the box.
 *
 * @example <Code lang="css" label="Additional CSS" onChange={setCss}>{css}</Code>
 */
const Code = ({ children, lang = 'jsx', onChange, label, minLines, className }) => {
  const editable = !!onChange;
  const code = editable ? children ?? '' : dedent(children);
  const change = useRef(onChange);
  change.current = onChange;
  const view = useRef(null);
  const box = useRef(null);
  const host = useRef(null);
  const near = useInView(box, '200px');
  const [ seen, setSeen ] = useState(false);
  const [ ready, setReady ] = useState(false);

  useEffect(() => { if (near) setSeen(true); }, [ near ]);
  // Read-only: drawn again when the code changes. Editable: made once a language, its text kept in step (setCode).
  useEffect(() => {
    if (!seen || !host.current) return;
    const v = new CodeView(host.current, code, lang, editable ? { onChange: (c) => change.current?.(c), label, minLines } : { label });
    view.current = v;
    v.mount().then(() => !v.destroyed && setReady(true));
    return () => v.destroy();
  }, [ seen, lang, editable, ...(editable ? [] : [ code ]) ]);
  useEffect(() => { if (editable) view.current?.setCode(code); }, [ code, editable ]);

  const copy = () => copyCode(code, toastSI);

  // .stack: the code and the copy button in one cell, the button over the top-right corner. An editor: its Format
  // button in a row under it instead, off its text.
  return (
    <div ref={box} data-component="code" data-lang={lang} className={cx(editable ? 'grid cols-1 gap-0' : 'stack', 'bg border round', className)}>
      {!ready && (
        // tabIndex: a box that scrolls sideways needs the keyboard too.
        <pre tabIndex={0} className="fs-sm overflow-auto" style={{ margin: 0, padding: 'var(--space-sm)', fontFamily: MONO, lineHeight: 'var(--line-height)',
          ...(editable && { minHeight: `${(minLines ?? 4) * 1.5}em` }) }}>
          <code>{code}</code>
        </pre>
      )}
      <div ref={host} data-code-host className="overflow-hidden" />
      {editable && FORMATS[lang] && (
        <div className="grid cols-1 pad-xs border-top">
          <Button icon="wand-magic-sparkles" data-format style={{ justifySelf: 'end' }} title="Lay the code out (Shift+Alt+F)" onClick={() => view.current?.format()}>Format</Button>
        </div>
      )}
      {!editable && (
        <Button icon="copy" aria-label="Copy code" title="Copy" data-copy onClick={copy}
          style={{ placeSelf: 'start end', margin: 'var(--space-xs)' }} />
      )}
    </div>
  );
};

export { Code, CodeView };
