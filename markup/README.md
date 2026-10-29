# Markup reference

The HTML the React components render, for hosts that write the same markup themselves (the WordPress blocks'
`render.php`, django-marccent's template tags), so their copies can't drift from the components unnoticed.

- `cases.json`: the inputs, in fields every host has (a button's label, href, icon, newTab, trace and extra classes; an
  icon's name, family and classes; a section's, grid's or card's settings, as `components/widgets/section.js` names
  them, and its `content`, HTML the host puts inside as it is; a nav bar's brand (name, href, logo) and menu items).
- `reference.json`: each case with the HTML the component renders for it. Written by `npm run markup`
  (`scripts/markup.mjs`, which maps the fields to the component's props); `npm test` fails when it's out of date.

A host's test renders each case its own way and compares it with `html`: the same elements, attributes and text (the
order of attributes and of classes, whitespace between tags, and in a `style` the spaces around `:` and `;` and a
last `;`, don't count).
