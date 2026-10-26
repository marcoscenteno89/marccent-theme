'use client';
import React, { useState, useRef } from 'react';
import { cx } from '../../lib/cx';
import { Button } from './button';
import '../../styles/components/form.css';
import '../../styles/components/pagination.css';

// Values of a form as a plain object: { name: value }. Several fields with one name (checkboxes) keep the last.
const formValues = (form) => Object.fromEntries(new FormData(form));

/*
 * Submit handler shared by Form and StepForm: stays on the page (without it the form would post to its action),
 * calls onSubmit with (values, form) and, while an async onSubmit runs, reports busy so the submit button is
 * disabled and a second click can't send the form twice.
 */
const useSubmit = (onSubmit) => {
  const [ busy, setBusy ] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    setBusy(true);
    try { await onSubmit?.(formValues(form), form); }
    finally { setBusy(false); }
  };
  return [ busy, submit ];
}

// Submit button: a spinner in place of the icon, and disabled, while the form is busy.
const SubmitButton = ({ busy, icon = 'paper-plane', children }) => (
  <Button type="submit" icon={busy ? 'fa-solid fa-spinner fa-spin' : icon} disabled={busy} className="primary">{children}</Button>
);

/**
 * Form: a native <form>. The browser validates the fields (required, type, pattern, min…) and shows its
 * own messages before onSubmit runs, so there is no validation code here. Children are plain inputs,
 * selects and textareas, or <Field> for a labelled one. Invalid fields are styled with :user-invalid.
 *
 * @param {Object} props
 * @param {Function} props.onSubmit - Called with (values, formElement); values is { name: value }. If it returns a
 *   promise, the submit button is disabled (with a spinner) until it settles.
 * @param {string|false} [props.submitLabel="Submit"] - Submit button text; false for no button.
 * @param {string} [props.submitIcon="paper-plane"] - Submit button icon (see Button).
 * @param {string} [props.className="grid gap-sm pairs"] - Replaces the default classes. .pairs (layout.css) gives
 *   every Field's label the same width.
 * @param {React.ReactNode} [props.children]
 * Any other prop (style, id, action, method…) goes on the <form>.
 *
 * @example
 * <Form onSubmit={(v) => search(v.city)} submitLabel="Search" submitIcon="magnifying-glass">
 *   <Field name="city" required />
 * </Form>
 * @example One row: fields and the button side by side (.inline-form, styles/components/form.css)
 * <Form className="grid inline-form" onSubmit={find}>
 *   <Input name="city" required /><Input name="state" /><Input name="zip" />
 * </Form>
 */
const Form = ({ onSubmit, submitLabel = 'Submit', submitIcon = 'paper-plane', className = 'grid gap-sm pairs', children, ...rest }) => {
  const [ busy, submit ] = useSubmit(onSubmit);
  return (
    <form data-component="form" className={className} aria-busy={busy || undefined} {...rest} onSubmit={submit}>
      {children}
      {submitLabel && <SubmitButton busy={busy} icon={submitIcon}>{submitLabel}</SubmitButton>}
    </form>
  );
}

/**
 * StepForm: a native form split into steps (<Step name="…">). All steps stay mounted (inactive ones are
 * hidden), so the final values include every step. Next, and jumping ahead from the step list, check every
 * step in between with the browser's own validation; going back is always allowed.
 *
 * @param {Object} props
 * @param {Function} props.onSubmit - Called with (values, formElement) after the last step.
 * @param {Function} [props.onStep] - Called with (index, values) after moving to another step.
 * @param {string} [props.className="grid cols-1 gap-sm"] - Replaces the default classes.
 * @param {React.ReactNode} [props.children]
 *
 * @example
 * <StepForm onSubmit={save}>
 *   <Step name="Contact"><Field name="email" type="email" required /></Step>
 *   <Step name="Message"><Field name="message" as="textarea" rows={4} required /></Step>
 * </StepForm>
 */
const StepForm = ({ onSubmit, onStep, className = 'grid cols-1 gap-sm', children, ...rest }) => {
  const steps = React.Children.toArray(children);
  const [ current, setCurrent ] = useState(0);
  const [ busy, submit ] = useSubmit(onSubmit);
  const form = useRef(null);
  const sets = useRef([]);
  const last = steps.length - 1;
  // reportValidity shows the browser's message on the first invalid field and returns false.
  const valid = (i) => [...sets.current[i].elements].every(el => el.reportValidity());
  const go = (to) => {
    for (let i = current; i < to; i++) if (!valid(i)) return setCurrent(i); // stop at the first invalid step
    setCurrent(to);
    onStep?.(to, formValues(form.current));
  };
  return (
    <form data-component="step-form" ref={form} className={className} aria-busy={busy || undefined} {...rest} onSubmit={submit}>
      <div className="grid fixed gap-0 divide border round" style={{ '--cols': steps.length }}>
        {steps.map((step, i) => (
          <button data-component="button" data-name={step.props.name} key={step.props.name} type="button" aria-current={i === current ? 'step' : undefined}
            className="page-link col-center w-100 h-100"
            onClick={() => go(i)}>
            {i + 1}. {step.props.name}
          </button>
        ))}
      </div>
      {steps.map((step, i) => (
        <fieldset data-component="step" key={step.props.name} ref={el => sets.current[i] = el} hidden={i !== current} aria-label={step.props.name}
          className={cx('grid gap-sm pairs', step.props.className)}>
          {step.props.children}
        </fieldset>
      ))}
      <div className="grid fixed cols-2 gap-sm">
        <Button disabled={current === 0} onClick={() => go(current - 1)}>Back</Button>
        {current < last
          ? <Button icon="arrow-right" onClick={() => go(current + 1)}>Next</Button>
          : <SubmitButton busy={busy}>Submit</SubmitButton>}
      </div>
    </form>
  );
}

// One step of a StepForm. Renders nothing itself; StepForm reads its name, className and children.
const Step = () => null;

export { Form, StepForm, Step };
