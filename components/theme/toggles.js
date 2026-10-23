'use client';
// Theme toggles: buttons that flip one setting of the saved theme (light / dark, glass, rainbow), and a reset. Each
// takes a scope (props.scope: "site", the default, or an element's id); withTheme gives it the theme as that scope
// sees it, and the scope's update and reset.
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { SITE } from '../../lib/singleton';
import { withTheme } from "./hoc";

const RainbowButton = (props) => {
  const rainbow = props.theme.rainbow;
  return (
    <Button icon={['fa-solid', rainbow ? 'fa-wand-magic-sparkles' : 'fa-wand-magic', props.className].filter(Boolean).join(' ')} aria-label="Toggle rainbow mode" onClick={() => props.update({rainbow: !rainbow})} />
  )  
}

const ModeButton = (props) => {
  const isDark = props.theme.value('isDark'); // the scope's own, else the site's (Theme.scoped)
  return (
    <Button
      icon={isDark ? 'sun' : 'moon'}
      className={[isDark ? 'light' : 'dark', props.className].filter(Boolean).join(' ')} /* filled in the mode it switches to (colors.css) */
      onClick={() => props.update({isDark: !isDark})}>
      {isDark ? 'Light' : 'Dark'}
    </Button>
  )  
}

// The glass toggle's own look, on no other button: a frosted pane (backdrop blur), a light sheen from the top-left,
// a bright top edge and a soft drop shadow; its hover-expand fill is a clear tint, the text stays the page color.
const GLASS = {
  background: 'radial-gradient(120% 90% at 25% 0%, rgb(255 255 255 / .45), transparent 55%), '
    + 'linear-gradient(135deg, color-mix(in srgb, var(--light) 25%, transparent), color-mix(in srgb, var(--light) 5%, transparent))',
  WebkitBackdropFilter: 'blur(10px) saturate(180%)',
  backdropFilter: 'blur(10px) saturate(180%)',
  borderColor: 'color-mix(in srgb, var(--light) 50%, transparent)',
  boxShadow: 'inset 0 1px 0 rgb(255 255 255 / .7), inset 0 -1px 1px rgb(0 0 0 / .15), 0 6px 18px rgb(0 0 0 / .25)',
  color: 'var(--body-color)',
  '--hover-from': 'color-mix(in srgb, var(--light) 30%, transparent)',
  '--hover-to': 'color-mix(in srgb, var(--primary) 30%, transparent)',
};

// Glass toggle. Off (disabled) when the design theme is glass already: it sets --theme-glass: 1 (styles/themes/).
const GlassButton = (props) => {
  const glass = props.theme.value('glass');
  const [ builtIn, setBuiltIn ] = useState(false);
  const design = props.theme.value('design');
  // Read on the scope's element when its design style changes (set in an effect, so after a frame).
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(props.theme.scopeId) ?? document.documentElement;
      setBuiltIn(getComputedStyle(el).getPropertyValue('--theme-glass').trim() === '1');
    });
    return () => cancelAnimationFrame(frame);
  }, [ design, props.theme.scopeId ]);
  return (
    <Button
      icon="fa-brands fa-hornbill"
      className={props.className}
      style={{ ...GLASS, ...props.style }}
      aria-pressed={!builtIn && !!glass}
      disabled={builtIn}
      title={builtIn ? 'Glass is built into this theme' : 'Glass'}
      onClick={() => props.update({ glass: !glass })}>
      Glass
    </Button>
  )  
}

// ThemeReset: the scope back to where it started (the site: every default; a section: the site's theme).
const ResetButton = (props) => (
  <Button icon="rotate-left" className={props.className} onClick={props.reset}
    title={props.theme.scopeId === SITE ? 'Put the whole site back to the default theme' : 'Put this section back to the site theme'}>Reset</Button>
);

const RainbowToggle = withTheme(RainbowButton);
const ModeToggle = withTheme(ModeButton);
const GlassToggle = withTheme(GlassButton);
const ThemeReset = withTheme(ResetButton);

export { RainbowToggle, ModeToggle, GlassToggle, ThemeReset }
