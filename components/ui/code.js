'use client';
import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { useInView } from '../../lib/in-view';
import { toastSI } from '../../lib/toasts';
import { Button } from './button';

/*
 * Code: a read-only code block on CodeMirror 6, highlighted in the theme's colors, with a copy button. CodeMirror only
 * loads (its own chunk) the first time a block comes near the screen; until then, and without JavaScript, the plain
 * code shows in a <pre> of the same size, so nothing jumps when it swaps in.
 */

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

// The languages, each loaded only when a block needs it. sh (and anything unknown): plain text.
const LANGS = {
  js: () => import('@codemirror/lang-javascript').then(m => m.javascript({ jsx: true })),
  jsx: () => import('@codemirror/lang-javascript').then(m => m.javascript({ jsx: true })),
  css: () => import('@codemirror/lang-css').then(m => m.css()),
  html: () => import('@codemirror/lang-html').then(m => m.html()),
};

// A theme color mixed toward the text color, so it stays readable on the page in light and dark mode.
const tone = (name) => `color-mix(in srgb, var(--${name}) 70%, var(--body-color))`;

// Common leading indentation is removed (and blank lines at the ends), so template literals can be indented with the JSX.
const dedent = (text) => {
  const lines = text.replace(/^\n+|\s+$/g, '').split('\n');
  const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  return lines.map(l => l.slice(indent)).join('\n');
};

/**
 * CodeView: a read-only CodeMirror editor in parent. mount() loads CodeMirror and the language, then draws; destroy()
 * removes it (also when called before mount() finishes).
 */
class CodeView {
  constructor(parent, code, lang) {
    this.parent = parent;
    this.code = code;
    this.lang = lang;
  }

  async mount() {
    const [ { EditorView, lineNumbers }, { EditorState }, { syntaxHighlighting, HighlightStyle }, { tags: t }, language ] = await Promise.all([
      import('@codemirror/view'), import('@codemirror/state'), import('@codemirror/language'), import('@lezer/highlight'),
      LANGS[this.lang]?.() ?? null,
    ]);
    if (this.destroyed) return;
    const highlight = HighlightStyle.define([
      { tag: [ t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword, t.tagName, t.typeName, t.className ], color: tone('primary') },
      { tag: [ t.string, t.special(t.string), t.regexp ], color: tone('secondary') },
      { tag: [ t.number, t.bool, t.null, t.atom, t.unit, t.color ], color: tone('info') },
      { tag: [ t.attributeName, t.propertyName ], color: tone('success') },
      { tag: t.comment, color: 'var(--muted-color)', fontStyle: 'italic' },
    ]);
    const look = EditorView.theme({
      '&': { backgroundColor: 'transparent', color: 'inherit', fontSize: 'var(--small-size)' },
      '&.cm-focused': { outline: 'none' },
      '.cm-scroller': { fontFamily: MONO, lineHeight: 'var(--line-height)' },
      '.cm-content': { padding: 'var(--space-sm) 0' },
      '.cm-line': { padding: '0 var(--space-sm)' },
      '.cm-gutters': { backgroundColor: 'transparent', color: 'inherit', opacity: .45, border: 'none' },
    });
    this.view = new EditorView({
      parent: this.parent,
      state: EditorState.create({
        doc: this.code,
        extensions: [
          this.code.includes('\n') && lineNumbers(), // no gutter for a one-line command
          EditorState.readOnly.of(true),
          EditorView.editable.of(false),
          syntaxHighlighting(highlight),
          look,
          language,
        ].filter(Boolean),
      }),
    });
  }

  destroy() {
    this.destroyed = true;
    this.view?.destroy();
  }
}

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

  const copy = () => navigator.clipboard.writeText(code).then(
    () => toastSI.add('Copied to the clipboard', 'success'),
    () => toastSI.add('Could not copy: select the code instead', 'danger'));

  // .stack: the code and the copy button in one cell, the button over the top-right corner.
  return (
    <div ref={box} data-component="code" className={cx('stack bg border round', className)}>
      {!ready && (
        <pre className="fs-sm overflow-auto" style={{ margin: 0, padding: 'var(--space-sm)', fontFamily: MONO, lineHeight: 'var(--line-height)' }}>
          <code>{code}</code>
        </pre>
      )}
      <div ref={host} className="overflow-hidden" />
      <Button icon="copy" aria-label="Copy code" title="Copy" onClick={copy}
        style={{ placeSelf: 'start end', margin: 'var(--space-xs)' }} />
    </div>
  );
};

export { Code, CodeView };
