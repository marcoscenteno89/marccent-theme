/*
 * TagInput's rules (components/ui/tag-input.js), shared with the plain-JS engine: typed text becomes tags.
 */

/**
 * addTags: tags with the text's added. Commas split it ("red, green" is two); each is trimmed, and empty ones,
 * ones already there (case ignored) and any past max are left out.
 * @param {string[]} tags
 * @param {string} text
 * @param {number} [max] - The most tags; 0 or none for no limit.
 * @returns {string[]}
 */
const addTags = (tags, text, max = 0) => {
  const out = [ ...tags ];
  for (const part of text.split(',')) {
    const tag = part.trim();
    if (!tag) {
      continue;
    }
    if (max && out.length >= max) {
      break;
    }
    if (out.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      continue;
    }
    out.push(tag);
  }
  return out;
};

// The keys that turn the typed text into tags.
const isCommit = (e) => e.key === 'Enter' || e.key === ',';

// A new element with classes and attributes.
const make = (tag, className, attrs = {}) => {
  const node = document.createElement(tag);
  node.className = className;
  for (const [ name, val ] of Object.entries(attrs)) {
    node.setAttribute(name, val);
  }
  return node;
};

// One tag as TagInput renders it: its text and a remove button.
const tagItem = (tag, remove) => {
  const icon = make('i', 'fa-solid fa-xmark', { 'aria-hidden': 'true', 'data-component': 'icon' });
  const button = make('button', 'tag-remove col-center', { type: 'button', 'data-component': 'button', 'aria-label': `Remove ${tag}` });
  button.append(icon);
  button.addEventListener('click', remove);
  const text = make('span', '');
  text.textContent = tag;
  const item = make('li', 'tag center gap-sm pill', { 'data-component': 'tag', 'data-name': tag });
  item.append(text, button);
  return item;
};

/**
 * tagInput: TagInput's behavior on its server-rendered markup, for the plain-JS engine: a
 * [data-component="tag-input"] (data-max for the most tags) holding a .tag-list <ul>, the text <input> and a hidden
 * <input> whose value is the tags joined by commas (the starting tags). Draws the same tags and keeps the hidden
 * input in step. Says so with a marccent:tags event (detail: the tags). Returns a function that stops.
 * @param {HTMLElement} root
 * @returns {() => void}
 */
const tagInput = (root) => {
  const list = root.querySelector('.tag-list');
  const entry = root.querySelector('.tag-entry');
  const hidden = root.querySelector('input[type="hidden"]');
  if (!list || !entry || !hidden) {
    return () => {};
  }
  const max = Number(root.dataset.max) || 0;
  let tags = addTags([], hidden.value, max);

  const use = (next) => {
    tags = next;
    hidden.value = tags.join(',');
    list.replaceChildren(...tags.map((tag, i) => tagItem(tag, () => {
      use(tags.filter((_, j) => j !== i));
      entry.focus();
    })));
    entry.disabled = Boolean(max) && tags.length >= max;
    root.dispatchEvent(new CustomEvent('marccent:tags', { detail: tags, bubbles: true }));
  };
  const commit = () => {
    use(addTags(tags, entry.value, max));
    entry.value = '';
  };
  const key = (e) => {
    if (isCommit(e)) {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && entry.value === '' && tags.length) {
      use(tags.slice(0, -1));
    }
  };
  // A pasted list ("a, b, c") becomes tags at once.
  const paste = (e) => {
    const text = e.clipboardData.getData('text');
    if (!text.includes(',')) {
      return;
    }
    e.preventDefault();
    use(addTags(tags, entry.value + text, max));
    entry.value = '';
  };
  const focus = (e) => {
    if (e.target === root) {
      entry.focus();
    }
  };

  entry.addEventListener('keydown', key);
  entry.addEventListener('paste', paste);
  entry.addEventListener('blur', commit);
  root.addEventListener('click', focus);
  use(tags);
  return () => {
    entry.removeEventListener('keydown', key);
    entry.removeEventListener('paste', paste);
    entry.removeEventListener('blur', commit);
    root.removeEventListener('click', focus);
    list.replaceChildren();
  };
};

export { tagInput, addTags, isCommit };
