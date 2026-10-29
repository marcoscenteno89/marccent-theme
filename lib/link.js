'use client';
import { createContext, forwardRef, useContext } from 'react';

/*
 * The links the components render (Button, Menu, Dock): a plain <a> by default, so they work on any page (WordPress,
 * Django, plain HTML). A router's link component (next/link) takes over through ThemeProvider's link prop, which sets
 * LinkContext, so the theme never imports a router. A client component, so Button and Menu stay server components:
 * they render <Link>, it reads the context in the browser.
 */
const LinkContext = createContext('a');

const Link = forwardRef((props, ref) => {
  const Component = useContext(LinkContext);
  return <Component ref={ref} {...props} />;
});

export { Link, LinkContext };
