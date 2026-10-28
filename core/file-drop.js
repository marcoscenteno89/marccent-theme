// "2.4 MB": a size people read.
const fileSize = (bytes) => {
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
 * checkFiles: the files that may go in, and a reason for each that may not (not an accepted type, too large).
 * @param {Iterable<File>} list @param {{ accept?: string, maxSize?: number }} rules
 * @returns {{ ok: File[], rejected: string[] }}
 */
const checkFiles = (list, { accept, maxSize } = {}) => {
  const ok = [];
  const rejected = [];
  for (const f of list) {
    if (!accepts(f, accept)) rejected.push(`${f.name}: not an accepted type`);
    else if (maxSize && f.size > maxSize) rejected.push(`${f.name}: larger than ${fileSize(maxSize)}`);
    else ok.push(f);
  }
  return { ok, rejected };
};

// The files become the input's (a DataTransfer is the one way to set them), so a form post sends them.
const setFiles = (input, files) => {
  const transfer = new DataTransfer();
  files.forEach(f => transfer.items.add(f));
  input.files = transfer.files;
};

// A new element with properties and children.
const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};

/**
 * fileDrop: FileDrop's behavior (components/ui/file-drop.js) on its server-rendered markup, for the plain-JS engine:
 * a [data-component="file-drop"] holding a .file-drop-zone <label> and its file <input> (accept, multiple as usual;
 * the largest size in bytes as data-max-size on the root). Draws the same list of chosen files and reasons.
 * Returns a function that stops.
 * @param {HTMLElement} root
 * @returns {() => void}
 */
const fileDrop = (root) => {
  const input = root.querySelector('input[type="file"]');
  const zone = root.querySelector('.file-drop-zone');
  if (!input || !zone) return () => {};
  const rules = { accept: input.accept, maxSize: Number(root.dataset.maxSize) || 0 };
  let files = [];
  let urls = [];
  const alert = el('ul', { className: 'grid cols-1 gap-0 fs-sm text-danger', hidden: true });
  alert.setAttribute('role', 'alert');
  const list = el('ul', { className: 'grid gap-sm', hidden: true });
  list.style.setProperty('--min', '14rem');
  list.setAttribute('aria-label', 'Chosen files');
  root.append(alert, list);

  const draw = (rejected) => {
    alert.replaceChildren(...rejected.map(r => el('li', { textContent: r })));
    alert.hidden = !rejected.length;
    urls.forEach(URL.revokeObjectURL);
    urls = [];
    list.replaceChildren(...files.map((f, i) => {
      let preview;
      if (f.type.startsWith('image/')) {
        const url = URL.createObjectURL(f);
        urls.push(url);
        preview = el('img', { src: url, alt: '', className: 'round' });
      } else {
        preview = el('i', { className: 'fa-solid fa-file' });
        preview.setAttribute('aria-hidden', 'true');
      }
      const icon = el('i', { className: 'fa-solid fa-xmark btn-icon' });
      icon.setAttribute('aria-hidden', 'true');
      const remove = el('button', { type: 'button', className: 'btn' }, icon);
      remove.setAttribute('aria-label', `Remove ${f.name}`);
      remove.dataset.component = 'button';
      remove.addEventListener('click', () => use(files.filter((_, j) => j !== i), []));
      const name = el('span', { className: 'grid cols-1 gap-0' },
        el('span', { className: 'text-truncate', textContent: f.name }), el('span', { className: 'fs-sm opacity-75', textContent: fileSize(f.size) }));
      name.style.minWidth = '0';
      return el('li', { className: 'file-drop-item bg border round pad-sm grid items-center gap-sm' }, preview, name, remove);
    }));
    list.hidden = !files.length;
  };
  const use = (next, rejected) => {
    files = next;
    setFiles(input, files);
    draw(rejected);
    root.dispatchEvent(new CustomEvent('marccent:files', { detail: files, bubbles: true }));
  };
  const take = (incoming) => {
    const { ok, rejected } = checkFiles(incoming, rules);
    if (ok.length || !input.multiple) use(input.multiple ? [ ...files, ...ok ] : ok.slice(0, 1), rejected);
    else draw(rejected);
  };

  const change = () => take([ ...input.files ]);
  const over = (e) => { e.preventDefault(); zone.classList.add('over'); };
  const leave = () => zone.classList.remove('over');
  const drop = (e) => {
    e.preventDefault();
    leave();
    if (!input.disabled) take([ ...e.dataTransfer.files ]);
  };
  input.addEventListener('change', change);
  zone.addEventListener('dragover', over);
  zone.addEventListener('dragleave', leave);
  zone.addEventListener('drop', drop);
  return () => {
    input.removeEventListener('change', change);
    zone.removeEventListener('dragover', over);
    zone.removeEventListener('dragleave', leave);
    zone.removeEventListener('drop', drop);
    urls.forEach(URL.revokeObjectURL);
    alert.remove();
    list.remove();
  };
};

export { fileDrop, checkFiles, setFiles, fileSize, accepts };
