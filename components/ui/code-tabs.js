'use client';
import { Code } from './code';
import { TabBar, Tab } from '../widgets/nav';

/*
 * CodeTabs: one editor per language under a TabBar (HTML, CSS, JS…), each the theme's Code as an editor; the admin
 * side of a block of hand-written code (Marccent Blocks' Custom HTML). An extra tab (preview) can show the result.
 */

const LABELS = { html: 'HTML', css: 'CSS', js: 'JS' };
const ICONS = { html: 'code', css: 'paintbrush', js: 'bolt' };

/**
 * @param {Object} props
 * @param {Object<string, string>} props.value - The code by language: { html, css, js }.
 * @param {(value: Object<string, string>) => void} props.onChange - The whole value, after an edit in any tab.
 * @param {string[]} [props.languages=['html', 'css', 'js']] - The tabs, in order.
 * @param {React.ReactNode} [props.preview] - A last tab, Preview, showing this.
 * @param {number} [props.minimumLines=8] - Each editor's height while nearly empty, in lines.
 * @param {string} [props.className]
 *
 * @example <CodeTabs value={{ html, css, js }} onChange={setCode} preview={<div dangerouslySetInnerHTML={{ __html: html }} />} />
 */
const CodeTabs = ({ value = {}, onChange, languages = [ 'html', 'css', 'js' ], preview, minimumLines = 8, className }) => (
  <TabBar className={className}>
    {languages.map((language) => (
      <Tab key={language} label={LABELS[language] ?? language.toUpperCase()} icon={ICONS[language]}>
        <Code language={language} label={`${LABELS[language] ?? language}`} minimumLines={minimumLines}
          onChange={(code) => onChange({ ...value, [language]: code })}>
          {value[language] ?? ''}
        </Code>
      </Tab>
    ))}
    {preview && <Tab key="preview" label="Preview" icon="eye">{preview}</Tab>}
  </TabBar>
);

export { CodeTabs };
