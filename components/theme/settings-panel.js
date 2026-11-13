'use client';
import { Field } from '../ui/field';
import { Button } from '../ui/button';
import SETTINGS from '../../markup/settings.json';

/*
 * A component's editing version (PRODUCT-LINE.md 5.6, #21): its settings (markup/settings.json) as the fields of a form,
 * so no admin types a field list by hand. settingsFields turns them into fields; SettingsPanel draws them, with the
 * theme's own controls or an admin's (controls: WordPress passes wp.components', Marccent Blocks' islandBlock). What a
 * setting can't say (a range's step, an icon or image picker, a list's item fields, a friendlier label) is an override
 * by the setting's name; false leaves a setting out.
 */

// "minimumColumnWidth" → "Minimum column width".
const labelOf = (key) => {
  const words = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
// A choice's label: "speedometer" → "Speedometer", "" → "None", "hover-float" → "Float".
const choiceLabel = (value) => {
  if (value === '' || value === null) return 'None';
  const text = String(value).replace(/^(hover|bg|pad|gap)-/, '').replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};
// An about that's a stray comment mark from the source it was read from ("*", "*/") says nothing.
const helpOf = (about) => (typeof about === 'string' && /[a-z]/i.test(about) ? about : undefined);

const TYPES = { text: 'text', number: 'number', boolean: 'toggle', list: 'list', object: 'object', content: 'content' };

/**
 * settingsFields: a component's settings as form fields, in settings.json's order.
 * @param {string|Object} component - Its name in markup/settings.json ("Gauge"), or its entry.
 * @param {Object} [overrides] - By setting name: fields to set on it ({ label, help, type: 'range', min, max, step,
 *   fields: [ … ] for a list's items, options }), or false to leave it out.
 * @returns {{ key: string, type: string, label: string, help?: string, default?: any, options?: [string, any][],
 *   required?: boolean, fields?: Object[] }[]} type: text, number, toggle, select (choices), list, object or
 *   content (the component's children: the admin's own, a block's inner blocks).
 */
const settingsFields = (component, overrides = {}) => {
  const entry = typeof component === 'string' ? SETTINGS[component] : component;
  if (!entry?.settings) return [];
  return Object.entries(entry.settings).flatMap(([ key, s ]) => {
    if (overrides[key] === false) return [];
    const field = {
      key,
      type: s.choices ? 'select' : TYPES[s.type] ?? 'text',
      label: labelOf(key),
      help: helpOf(s.about),
      ...(s.default !== undefined && { default: s.default }),
      ...(s.choices && { options: s.choices.map((c) => [ choiceLabel(c), c ]) }),
      ...(s.validate === 'required' && { required: true }),
    };
    return [ { ...field, ...overrides[key] } ];
  });
};

/* The theme's own controls, one per field type: each takes { field, value, onChange }. */
const Text = ({ field, value, onChange }) => (
  <Field name={field.key} label={field.label} value={value ?? ''} required={field.required} title={field.help}
    onChange={(e) => onChange(e.target.value)} />
);
const NumberControl = ({ field, value, onChange }) => (
  <Field name={field.key} label={field.label} type={field.type === 'range' ? 'range' : 'number'} min={field.min}
    max={field.max} step={field.step} value={value ?? ''} title={field.help}
    onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
);
const Toggle = ({ field, value, onChange }) => (
  <label className="row items-center gap-sm" title={field.help}>
    <input type="checkbox" name={field.key} checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {field.label}
  </label>
);
const Select = ({ field, value, onChange }) => (
  <Field as="select" name={field.key} label={field.label} value={value ?? ''} title={field.help}
    onChange={(e) => onChange(field.options.find(([ , v ]) => String(v) === e.target.value)?.[1])}>
    {field.options.map(([ label, v ]) => <option key={String(v)} value={String(v)}>{label}</option>)}
  </Field>
);
// A list: its rows, each the list's item fields, to add and remove.
const List = ({ field, value, onChange, controls }) => {
  const rows = Array.isArray(value) ? value : [];
  const put = (i, row) => onChange(rows.map((r, j) => (j === i ? row : r)));
  return (
    <fieldset className="grid cols-1 gap-sm">
      <legend className="fw-bold">{field.label}</legend>
      {rows.map((row, i) => (
        <div key={i} className="grid cols-1 gap-sm pad-sm border round">
          {(field.fields ?? []).map((f) => <Control key={f.key} field={f} value={row?.[f.key]} controls={controls}
            onChange={(v) => put(i, { ...row, [f.key]: v })} />)}
          <Button icon="trash" className="outline-danger" onClick={() => onChange(rows.filter((r, j) => j !== i))}>Remove</Button>
        </div>
      ))}
      <Button icon="plus" className="outline-primary"
        onClick={() => onChange([ ...rows, Object.fromEntries((field.fields ?? []).filter((f) => f.default !== undefined).map((f) => [ f.key, f.default ])) ])}>
        Add
      </Button>
    </fieldset>
  );
};
const CONTROLS = { text: Text, number: NumberControl, range: NumberControl, toggle: Toggle, select: Select, list: List };

const Control = ({ field, value, onChange, controls }) => {
  const Draw = controls?.[field.type] ?? CONTROLS[field.type];
  return Draw ? <Draw field={field} value={value} onChange={onChange} controls={controls} /> : null;
};

/**
 * SettingsPanel: a component's settings as a form: its fields (settingsFields), each drawn by its type's control.
 * Content and object settings are the admin's own (a block's inner blocks), so they aren't drawn.
 * @param {Object} props
 * @param {string|Object} props.component - Its name in markup/settings.json, or its entry.
 * @param {Object} props.values - The settings as they are, by name; a missing one shows its default.
 * @param {(key: string, value: any) => void} props.onChange
 * @param {Object} [props.overrides] - As settingsFields takes them.
 * @param {Object} [props.controls] - An admin's controls by field type (text, number, range, toggle, select, list…),
 *   each ({ field, value, onChange }); the theme's own for the rest.
 * @param {string} [props.className]
 *
 * @example <SettingsPanel component="Gauge" values={gauge} onChange={(k, v) => setGauge({ ...gauge, [k]: v })} />
 */
const SettingsPanel = ({ component, values = {}, onChange, overrides, controls, className }) => (
  <div data-component="settings-panel" className={className ?? 'grid cols-1 gap-sm'}>
    {settingsFields(component, overrides).filter((f) => f.type !== 'content' && f.type !== 'object').map((f) => (
      <Control key={f.key} field={f} value={values[f.key] ?? f.default} controls={controls} onChange={(v) => onChange(f.key, v)} />
    ))}
  </div>
);

export { SettingsPanel, settingsFields };
