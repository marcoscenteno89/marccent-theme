// Shared: no 'use client' (no state or effects), so it renders on the server or in the browser, wherever it's used.
import React, { useId } from 'react';
import { cx } from '../../lib/cx';
import '../../styles/components/accordion.css';

/**
 * Accordion built on <details>/<summary>. The browser opens and closes
 * items; items share a name, so opening one closes the others (pass multiple to allow several open).
 * Lines between items come from .divide; look in styles/components/accordion.css, animation in animations.css, colors in colors.css.
 * @example
 * <Accordion defaultOpen={0}>
 *   <AccordionItem header="Title" className="grid cols-1 gap-sm">Body</AccordionItem>
 * </Accordion>
 */
const Accordion = (props) => {
  const { children, defaultOpen = 0, multiple = false, className = '' } = props;
  const name = useId();
  return (
    <div data-component="accordion" className={`accordion grid cols-1 gap-0 divide border round ${className}`.trim()}>
      {React.Children.toArray(children).map((child, i) => React.cloneElement(child, {
        name: multiple ? undefined : name,
        defaultOpen: i === defaultOpen,
      }))}
    </div>
  );
}

// One item: header is the always-visible summary row, children the body. className goes on the body.
const AccordionItem = (props) => {
  const { header, children, className = '', name, defaultOpen = false } = props;
  return (
    <details name={name} open={defaultOpen}>
      <summary className="header pad-sm">{header}</summary>
      <div className={cx('pad-sm', className)}>{children}</div>
    </details>
  );
}

export { Accordion, AccordionItem };
