import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Store } from './store';

dayjs.extend(relativeTime);

// Tones with a color (defaults.css): toastSI.add(msg, 'success') fills it like <Alert tone="success">.
const TONES = [ 'primary', 'secondary', 'success', 'danger', 'info' ];

// A new element with a class (and text).
const create = (tag, className, text) => {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (text != null) {
    el.textContent = text;
  }
  return el;
};

/**
 * Toasts: the site's messages, a plain object that keeps them and shows them. Anyone adds one (toastSI.add) from
 * anywhere, in React or not; once mounted it draws them itself: a stack in the bottom-right corner, newest last
 * (styles/components/toast.css: React's <Toast /> imports it, a plain page loads it). Only the
 * newest maximum are kept. A toast stays until closed; its time ("2 minutes ago") updates every minute.
 */
class Toasts extends Store {
  list = [];      // { id, time, type, msg }
  maximum = 5;
  title = 'Marccent';
  #el = null;
  #nodes = new Map();  // id → its element, so a new toast doesn't redraw (and re-animate) the others
  #timer = null;
  #unsubscribe = null;
  #next = 0;

  add(msg, type = '') {
    this.#next++;
    this.list.push({ id: this.#next, time: new Date(), type, msg });
    if (this.list.length > this.maximum) {
      this.list.shift();
    }
    this.emit();
    return this;
  }

  remove(id) {
    this.list = this.list.filter(t => t.id !== id);
    this.emit();
    return this;
  }

  /**
   * mount: shows the toasts in parent (the page's body by default) from now on. Once; mounting again moves them.
   * @param {Element} [parent=document.body]
   * @param {Object} [opts]
   * @param {string} [opts.title] - Each toast's heading.
   * @param {number} [opts.maximum] - How many to keep.
   */
  mount(parent = document.body, { title = this.title, maximum = this.maximum } = {}) {
    this.title = title;
    this.maximum = maximum;
    this.#el ??= create('div', 'd-grid gap-xs w-max pe-none z-toast position-fixed bottom-0 end-0 pad');
    this.#el.dataset.component = 'toasts';
    parent.append(this.#el);
    this.#unsubscribe ??= this.subscribe(() => this.render());
    this.#timer ??= setInterval(() => this.render(), 60000);
    this.render();
    return this;
  }

  unmount() {
    this.#unsubscribe?.();
    clearInterval(this.#timer);
    this.#el?.remove();
    this.#nodes.clear();
    this.#el = null;
    this.#unsubscribe = null;
    this.#timer = null;
  }

  render() {
    if (!this.#el) {
      return;
    }
    const ids = new Set(this.list.map(t => t.id));
    for (const [ id, node ] of this.#nodes) {
      if (!ids.has(id)) {
        node.remove();
        this.#nodes.delete(id);
      }
    }
    for (const t of this.list) {
      const node = this.#nodes.get(t.id) ?? this.#node(t);
      node.querySelector('small').textContent = dayjs(t.time).fromNow();
    }
  }

  // One toast: a header (title | time | close) and the message.
  #node(t) {
    const node = create('div', 'toast round shadow fs-sm pe-auto');
    node.dataset.component = 'toast';
    node.setAttribute('role', 'alert');
    node.setAttribute('aria-live', 'assertive');
    node.setAttribute('aria-atomic', 'true');
    if (TONES.includes(t.type)) {
      node.style.backgroundColor = `var(--${t.type}-mode)`;
      node.style.color = `var(--${t.type}-mode-text)`;
    }

    const close = create('button', 'btn-plain col-center round icon-sm opacity-50 hover-opaque');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    close.addEventListener('click', () => this.remove(t.id));

    const header = create('div', 'header pad fs-xs');
    header.append(create('strong', null, this.title), create('small'), close);

    node.append(header, create('div', 'pad fs-xs text-break', t.msg));
    this.#el.append(node);
    this.#nodes.set(t.id, node);
    return node;
  }
}

// SI => Single Instance: one list for the whole site.
const toastSI = new Toasts();

export { toastSI, Toasts };
