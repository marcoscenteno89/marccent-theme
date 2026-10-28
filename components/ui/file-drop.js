'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { Button } from './button';
import { Icon } from './icon';
import '../../styles/components/form.css';

// "2.4 MB": a size people read.
const size = (bytes) => {
  const units = [ 'B', 'KB', 'MB', 'GB' ];
  const i = Math.min(units.length - 1, Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
};

// Whether a file matches an accept list as the file picker reads it: ".pdf, image/*, text/plain".
const accepts = (file, accept) => !accept || accept.split(',').map(s => s.trim().toLowerCase()).some((rule) =>
  rule.startsWith('.') ? file.name.toLowerCase().endsWith(rule)
    : rule.endsWith('/*') ? file.type.startsWith(rule.slice(0, -1))
      : file.type === rule);

/**
 * FileDrop: a file field with a drop zone: drag files onto it, or click it (or Tab to it and press Enter) for the
 * file picker. The real <input type="file"> stays in the form (visually hidden), and always holds the files listed,
 * so a plain form post or Form's values send them. Picked files list under the zone with a preview for images and a
 * button to remove each; files that don't match accept or are over maxSize are left out with the reason.
 *
 * @param {Object} props
 * @param {string} props.name - The field's name in the form.
 * @param {string} [props.label='Drop files here or click to choose'] - The zone's text.
 * @param {string} [props.hint] - A line under it: the limits, e.g. "PNG or JPG, up to 5 MB".
 * @param {string} [props.accept] - As the input's: ".pdf, image/*".
 * @param {boolean} [props.multiple] - Several files; each drop or pick adds to the list.
 * @param {number} [props.maxSize] - Largest file, in bytes.
 * @param {(files: File[]) => void} [props.onChange] - Called with the list each time it changes.
 * @param {string} [props.className] - Extra classes on the whole field.
 * Any other prop (required, disabled…) goes on the input.
 *
 * @example <FileDrop name="photos" accept="image/*" multiple maxSize={5e6} hint="Images up to 5 MB" />
 */
const FileDrop = ({ name, label = 'Drop files here or click to choose', hint, accept, multiple = false, maxSize, onChange, className, ...rest }) => {
  const id = useId();
  const input = useRef(null);
  const [ files, setFiles ] = useState([]);
  const [ rejected, setRejected ] = useState([]);
  const [ over, setOver ] = useState(false);

  // Image previews, freed when the list changes or the field goes.
  const previews = useMemo(() => files.map(f => f.type.startsWith('image/') ? URL.createObjectURL(f) : null), [ files ]);
  useEffect(() => () => previews.forEach(url => url && URL.revokeObjectURL(url)), [ previews ]);

  // The list becomes the input's files too (a DataTransfer is the one way to set them).
  const use = (next) => {
    const transfer = new DataTransfer();
    next.forEach(f => transfer.items.add(f));
    input.current.files = transfer.files;
    setFiles(next);
    onChange?.(next);
  };
  const take = (list) => {
    const ok = [];
    const bad = [];
    for (const f of list) {
      if (!accepts(f, accept)) bad.push(`${f.name}: not an accepted type`);
      else if (maxSize && f.size > maxSize) bad.push(`${f.name}: larger than ${size(maxSize)}`);
      else ok.push(f);
    }
    setRejected(bad);
    if (ok.length || !multiple) use(multiple ? [ ...files, ...ok ] : ok.slice(0, 1));
  };
  const drop = (e) => {
    e.preventDefault();
    setOver(false);
    if (!rest.disabled) take(e.dataTransfer.files);
  };

  return (
    <div data-component="file-drop" className={cx('file-drop grid cols-1 gap-sm', className)}>
      <label htmlFor={id} className={cx('file-drop-zone col-center gap-sm pad-lg text-center', over && 'over')}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop}>
        <Icon name="cloud-arrow-up" className="fs-lg" />
        <strong>{label}</strong>
        {hint && <span className="fs-sm opacity-75">{hint}</span>}
      </label>
      <input ref={input} id={id} name={name} type="file" accept={accept} multiple={multiple} className="visually-hidden"
        onChange={(e) => take([ ...e.target.files ])} {...rest} />
      {rejected.length > 0 && (
        <ul role="alert" className="grid cols-1 gap-0 fs-sm text-danger">{rejected.map(r => <li key={r}>{r}</li>)}</ul>
      )}
      {files.length > 0 && (
        <ul className="grid gap-sm" style={{ '--min': '14rem' }} aria-label="Chosen files">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${f.lastModified}`} className="file-drop-item bg border round pad-sm grid items-center gap-sm">
              {previews[i] ? <img src={previews[i]} alt="" className="round" /> : <Icon name="file" />}
              <span className="grid cols-1 gap-0" style={{ minWidth: 0 }}>
                <span className="text-truncate">{f.name}</span>
                <span className="fs-sm opacity-75">{size(f.size)}</span>
              </span>
              <Button icon="xmark" aria-label={`Remove ${f.name}`} onClick={() => use(files.filter((_, j) => j !== i))} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { FileDrop };
