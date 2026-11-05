/*
 * CodeView: a CodeMirror 6 editor showing code, highlighted in the theme's colors; read-only, or editable with an
 * onChange (an admin's CSS field). CodeMirror and the
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

// A theme color as text on the page (its ink, styles/tokens/defaults.css), readable in light and dark mode.
// Fallbacks for a page without the theme's tokens (an admin screen around the editor): highlighting still shows.
const tone = (name) => `var(--${name}-ink, ${({ primary: '#1f64cf', secondary: '#a1306b', info: '#0b7285', success: '#2b8a3e' })[name]})`;

// Common leading indentation is removed (and blank lines at the ends), so template literals can be indented with the JSX.
const dedent = (text) => {
  const lines = text.replace(/^\n+|\s+$/g, '').split('\n');
  const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  return lines.map(l => l.slice(indent)).join('\n');
};

/**
 * CodeView: a CodeMirror editor in parent. mount() loads CodeMirror and the language, then draws; destroy() removes
 * it (also when called before mount() finishes). Read-only, unless options.onChange: then it's editable, calls
 * onChange(code) on every edit, and setCode(code) replaces its text from outside (an undo elsewhere).
 * @param {HTMLElement} parent @param {string} code @param {string} lang
 * @param {{ onChange?: (code: string) => void, label?: string, minLines?: number }} [options] - label: its accessible
 *   name (default "Code (lang)"); minLines: the height it keeps while nearly empty (editable).
 */
class CodeView {
  constructor(parent, code, lang, options = {}) {
    this.parent = parent;
    this.code = code;
    this.lang = lang;
    this.options = options;
  }

  get editable() { return !!this.options.onChange; }

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
    const { onChange, label, minLines = 4 } = this.options;
    const look = EditorView.theme({
      '&': { backgroundColor: 'transparent', color: 'inherit', fontSize: 'var(--small-size, 13px)' },
      '&.cm-focused': { outline: 'none' },
      '.cm-scroller': { fontFamily: MONO, lineHeight: 'var(--line-height, 1.5)' },
      '.cm-content': { padding: 'var(--space-sm, .5rem) 0', ...(onChange && { minHeight: `calc(${minLines}lh + var(--space-sm, .5rem) * 2)`, caretColor: 'currentColor' }) },
      '.cm-line': { padding: '0 var(--space-sm, .5rem)' },
      '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--muted-color, #757575)', border: 'none' },
    });
    this.view = new EditorView({
      parent: this.parent,
      state: EditorState.create({
        doc: this.code,
        extensions: [
          (onChange || this.code.includes('\n')) && lineNumbers(), // no gutter for a one-line command
          EditorState.readOnly.of(!onChange),
          EditorView.editable.of(!!onChange),
          EditorView.contentAttributes.of({ 'aria-label': label || `Code (${this.lang})` }),
          onChange && EditorView.lineWrapping,
          onChange && EditorView.updateListener.of((u) => u.docChanged && onChange(u.state.doc.toString())),
          syntaxHighlighting(highlight),
          look,
          language,
        ].filter(Boolean),
      }),
    });
    // The box scrolls sideways for long lines: in the tab order, so the keyboard can scroll it too. (An editable one is
    // reached through its text instead, and wraps.)
    if (!onChange) this.view.scrollDOM.tabIndex = 0;
  }

  // Replaces the text, when it changed from outside (not on the editor's own edits: the cursor stays).
  setCode(code) {
    if (!this.view || code === this.view.state.doc.toString()) return;
    this.view.dispatch({ changes: { from: 0, to: this.view.state.doc.length, insert: code } });
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
