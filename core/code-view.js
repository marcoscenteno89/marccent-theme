/*
 * CodeView: a read-only CodeMirror 6 editor showing code, highlighted in the theme's colors. CodeMirror and the
 * language load (their own chunks) on mount(). Plain JavaScript: React's Code (components/ui/code.js) and the markup
 * engine's code blocks (core/components.js) both use it.
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

// Copies code to the clipboard and says how it went in a toast.
const copyCode = (code, toasts) => navigator.clipboard.writeText(code).then(
  () => toasts.add('Copied to the clipboard', 'success'),
  () => toasts.add('Could not copy: select the code instead', 'danger'));

export { CodeView, dedent, copyCode, MONO };
