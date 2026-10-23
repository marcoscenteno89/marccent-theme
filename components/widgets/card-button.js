// Shared: no 'use client', so server components (AppCard) can use it too; a client module's plain values can't be.

// The two button looks for a StatCard, in the mode's text color: filled (light in dark mode, dark in light mode) and
// outlined. One-offs as inline styles: <Button style={CARD_BUTTON.filled} …>.
const CARD_BUTTON = {
  filled: { backgroundColor: 'var(--body-color)', color: 'var(--body-bg)', borderColor: 'var(--body-color)' },
  outline: { borderColor: 'currentColor', color: 'inherit', '--muted-bg': 'color-mix(in srgb, currentColor 15%, transparent)' },
};

export { CARD_BUTTON };
