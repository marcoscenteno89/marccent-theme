'use client';
import { useId, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from './icon';
import { addTags, isCommit } from '../../core/tag-input';
import '../../styles/components/tag-input.css';

/**
 * TagInput: a text field that turns what you type into tags (pills with a remove button), for keywords, emails,
 * skills. Enter or a comma adds the text as a tag, a pasted list "a, b, c" adds each, Backspace in the empty field
 * takes the last one off and leaving the field adds what's left. Duplicates (case ignored) aren't added. A hidden
 * input holds the tags joined by commas, so a plain form post sends them. suggestions show as the browser's own
 * autocomplete list. The rules live in core/tag-input.js, shared with the plain-JS engine.
 *
 * @param {Object} props
 * @param {string} props.name - The field's name in the form (the hidden input's).
 * @param {string} [props.label='Add a tag'] - The text field's placeholder and accessible name.
 * @param {string[]} [props.defaultValue] - The tags at first.
 * @param {string[]} [props.suggestions] - Offered while typing.
 * @param {number} [props.max] - The most tags; the field turns off at the limit.
 * @param {(tags: string[]) => void} [props.onChange]
 * @param {string} [props.className] - Extra classes on the whole field.
 *
 * @example <TagInput name="skills" defaultValue={[ 'CSS', 'React' ]} suggestions={[ 'Django', 'Python' ]} max={6} />
 */
const TagInput = ({ name, label = 'Add a tag', defaultValue = [], suggestions, max = 0, onChange, className }) => {
  const id = useId();
  const entry = useRef(null);
  const [ tags, setTags ] = useState(() => addTags([], defaultValue.join(','), max));
  const [ text, setText ] = useState('');
  const full = Boolean(max) && tags.length >= max;

  const use = (next) => {
    setTags(next);
    onChange?.(next);
  };
  const commit = (value = text) => {
    if (value.trim()) {
      use(addTags(tags, value, max));
    }
    setText('');
  };
  const key = (e) => {
    if (isCommit(e)) {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && text === '' && tags.length) {
      use(tags.slice(0, -1));
    }
  };
  const paste = (e) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted.includes(',')) {
      e.preventDefault();
      commit(text + pasted);
    }
  };
  const remove = (i) => {
    use(tags.filter((_, j) => j !== i));
    entry.current.focus();
  };

  // A click on the box (not a tag) puts the cursor in the field, as if the box were the input.
  return (
    <div data-component="tag-input" data-max={max || undefined} className={cx('tag-input row-wrap', className)}
      onClick={(e) => e.target === e.currentTarget && entry.current.focus()}>
      <ul className="tag-list row-wrap" aria-label="Tags">
        {tags.map((tag, i) => (
          <li key={tag} data-component="tag" data-name={tag} className="tag center gap-sm pill">
            <span>{tag}</span>
            <button type="button" data-component="button" className="tag-remove col-center" aria-label={`Remove ${tag}`}
              onClick={() => remove(i)}>
              <Icon name="xmark" />
            </button>
          </li>
        ))}
      </ul>
      <input ref={entry} className="tag-entry" aria-label={label} placeholder={full ? `Up to ${max}` : label}
        list={suggestions ? `${id}-list` : undefined} disabled={full} value={text}
        onChange={(e) => setText(e.target.value)} onKeyDown={key} onPaste={paste} onBlur={() => commit()} />
      {suggestions && (
        <datalist id={`${id}-list`}>
          {suggestions.filter((s) => !tags.includes(s)).map((s) => <option key={s} value={s} />)}
        </datalist>
      )}
      <input type="hidden" name={name} value={tags.join(',')} />
    </div>
  );
};

export { TagInput };
