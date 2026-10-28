'use client';
import React, { useState, useRef, useEffect } from 'react';
import { cx } from '../../lib/cx';
import { Button } from './button';
import '../../styles/components/form.css';
import '../../styles/components/pagination.css';

// Values of a form as a plain object: { name: value }. Several fields with one name (checkboxes) keep the last.
const formValues = (form) => Object.fromEntries(new FormData(form));

/*
 * Submit handler shared by Form and StepForm: stays on the page (without it the form would post to its action) and
 * calls onSubmit with (values, form). Its state is the submit button's (Button state): "loading" while an async
 * onSubmit runs, so a second click can't send the form twice, then "done" or "error" for a moment (an error is
 * thrown on, as before). Busy: loading.
 */
const SETTLED_MS = 2500;
const useSubmit = (onSubmit) => {
  const [ state, setState ] = useState();
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const submit = async (e) => {
    e.preventDefault();
    if (state === 'loading') return;
    const form = e.currentTarget;
    clearTimeout(timer.current);
    setState('loading');
    const settle = (end) => {
      setState(end);
      timer.current = setTimeout(() => setState(undefined), SETTLED_MS);
    };
    try {
      await onSubmit?.(formValues(form), form);
      settle('done');
    } catch (err) {
      settle('error');
      throw err;
    }
  };
  return [ state, submit ];
}

// Submit button: its state follows the form's (spinner and disabled while busy, then done or failed).
const SubmitButton = ({ state, icon = 'paper-plane', children }) => (
  <Button type="submit" icon={icon} state={state ?? 'idle'} className="primary">{children}</Button>
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
  const [ state, submit ] = useSubmit(onSubmit);
  return (
    <form data-component="form" className={className} aria-busy={state === 'loading' || undefined} {...rest} onSubmit={submit}>
      {children}
      {submitLabel && <SubmitButton state={state} icon={submitIcon}>{submitLabel}</SubmitButton>}
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
  const [ state, submit ] = useSubmit(onSubmit);
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
    <form data-component="step-form" ref={form} className={className} aria-busy={state === 'loading' || undefined} {...rest} onSubmit={submit}>
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
          : <SubmitButton state={state}>Submit</SubmitButton>}
      </div>
    </form>
  );
}

// One step of a StepForm. Renders nothing itself; StepForm reads its name, className and children.
const Step = () => null;

export { Form, StepForm, Step };
