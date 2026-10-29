/*
 * DataTable's rules (components/ui/data-table.js), shared with the plain-JS engine: filter, sort and page rows. The
 * engine's setup (dataTable, below) does the same to a server-rendered <table>, moving its <tr>s instead of data.
 */

// A cell value as a number when it reads as one ("12", "-3.5"), else null.
const asNumber = (value) => {
  if (typeof value === 'number') {
    return value;
  }
  const text = String(value ?? '').trim();
  if (text === '') {
    return null;
  }
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
};

/**
 * compareValues: numbers as numbers, the rest as text in the reader's language, digits read as numbers inside text
 * ("item 2" before "item 10"), case ignored. Empty values sort last.
 */
const compareValues = (a, b) => {
  const emptyA = a === null || a === undefined || a === '';
  const emptyB = b === null || b === undefined || b === '';
  if (emptyA || emptyB) {
    return emptyA - emptyB;
  }
  const x = asNumber(a);
  const y = asNumber(b);
  if (x !== null && y !== null) {
    return x - y;
  }
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

/**
 * nextSort: a header click's new sort. The same column goes ascending → descending → unsorted; another column
 * starts ascending.
 * @param {{ key: string, dir: 'asc'|'desc' } | null} sort
 * @param {string} key
 */
const nextSort = (sort, key) => {
  if (sort?.key !== key) {
    return { key, dir: 'asc' };
  }
  if (sort.dir === 'asc') {
    return { key, dir: 'desc' };
  }
  return null;
};

// aria-sort for a column: what screen readers announce on its header.
const ariaSort = (sort, key) => {
  if (sort?.key !== key) {
    return undefined;
  }
  return sort.dir === 'asc' ? 'ascending' : 'descending';
};

// The header's icon for a column's sort state.
const sortIcon = (sort, key) => {
  if (sort?.key !== key) {
    return 'sort';
  }
  return sort.dir === 'asc' ? 'sort-up' : 'sort-down';
};

/**
 * tableRows: the rows matching the filter, in the sort's order (a copy; rows is left alone).
 * @param {any[]} rows
 * @param {Object} opts
 * @param {string} [opts.query] - Text to look for, in any cell; case ignored.
 * @param {(row: any, key: string) => any} opts.value - A row's value for a column.
 * @param {string[]} opts.keys - The columns the filter searches.
 * @param {{ key: string, dir: 'asc'|'desc' } | null} [opts.sort]
 */
const tableRows = (rows, { query = '', value, keys, sort }) => {
  let out = [ ...rows ];
  const q = query.trim().toLowerCase();
  if (q) {
    out = out.filter((row) => keys.some((key) => String(value(row, key) ?? '').toLowerCase().includes(q)));
  }
  if (sort) {
    const sign = sort.dir === 'desc' ? -1 : 1;
    // Stable: rows that tie keep their order.
    out.sort((a, b) => sign * compareValues(value(a, sort.key), value(b, sort.key)));
  }
  return out;
};

// "Showing 11–20 of 42": the status line under the table.
const rangeText = (page, pageSize, total) => {
  if (!total) {
    return 'No matching rows';
  }
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return `Showing ${first}–${last} of ${total}`;
};

// A new element with classes, text and attributes.
const make = (tag, className, attrs = {}) => {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  for (const [ name, val ] of Object.entries(attrs)) {
    if (val !== undefined && val !== false) {
      node.setAttribute(name, val);
    }
  }
  return node;
};

// One Pagination button (components/ui/pagination.js renders the same).
const pageButton = (page, text, { label, disabled, current }) => {
  const button = make('button', 'page-link col-center w-100 h-100', {
    type: 'button',
    'data-component': 'button',
    'data-name': label ?? page,
    'aria-label': label,
    'aria-current': page === current && !label ? 'page' : undefined,
  });
  button.disabled = disabled;
  button.dataset.page = page;
  button.textContent = text;
  return button;
};

/**
 * dataTable: DataTable's behavior on its server-rendered markup, for the plain-JS engine: a
 * [data-component="data-table"] holding a <table class="table"> whose sortable headers hold a .sort-button (the
 * column's position is the key), and optionally an <input type="search"> (filters the rows), data-page-size on the
 * root (pages them) and an [aria-live] status line. A cell sorts by its data-value, else its text. Returns a
 * function that stops.
 * @param {HTMLElement} root
 * @returns {() => void}
 */
const dataTable = (root) => {
  const table = root.querySelector('table');
  const body = table?.tBodies[0];
  if (!body) {
    return () => {};
  }
  const rows = [ ...body.rows ];
  const headers = [ ...table.tHead.rows[0].cells ];
  const search = root.querySelector('input[type="search"]');
  const status = root.querySelector('[aria-live]');
  const pageSize = Number(root.dataset.pageSize) || 0;
  const keys = headers.map((_, i) => String(i));
  const value = (row, key) => {
    const cell = row.cells[Number(key)];
    return cell?.dataset.value ?? cell?.textContent.trim();
  };
  let sort = null;
  let page = 1;

  const pager = make('nav', 'grid fixed gap-0 divide border round', { 'data-component': 'pagination', 'aria-label': 'Pages' });
  if (pageSize) {
    root.insertBefore(pager, status);
  }

  const drawPager = (pages) => {
    pager.hidden = pages < 2;
    pager.style.setProperty('--cols', pages + 4);
    const first = page === 1;
    const last = page === pages;
    const state = { current: page };
    pager.replaceChildren(
      pageButton(1, '«', { ...state, label: 'First page', disabled: first }),
      pageButton(page - 1, '‹', { ...state, label: 'Previous page', disabled: first }),
      ...Array.from({ length: pages }, (_, i) => pageButton(i + 1, String(i + 1), state)),
      pageButton(page + 1, '›', { ...state, label: 'Next page', disabled: last }),
      pageButton(pages, '»', { ...state, label: 'Last page', disabled: last }),
    );
  };

  const draw = () => {
    const shown = tableRows(rows, { query: search?.value ?? '', value, keys, sort });
    const size = pageSize || shown.length || 1;
    const pages = Math.max(1, Math.ceil(shown.length / size));
    page = Math.min(page, pages);
    body.replaceChildren(...shown.slice((page - 1) * size, page * size));
    headers.forEach((th, i) => {
      const icon = th.querySelector('.sort-button .fa-solid');
      if (!icon) {
        return;
      }
      const sorted = ariaSort(sort, String(i));
      if (sorted) {
        th.setAttribute('aria-sort', sorted);
      } else {
        th.removeAttribute('aria-sort');
      }
      icon.className = `fa-solid fa-${sortIcon(sort, String(i))}`;
    });
    if (pageSize) {
      drawPager(pages);
    }
    if (status) {
      status.textContent = rangeText(page, size, shown.length);
    }
  };

  const click = (e) => {
    const button = e.target.closest('.sort-button');
    if (!button) {
      return;
    }
    sort = nextSort(sort, String(headers.indexOf(button.closest('th'))));
    draw();
  };
  const turn = (e) => {
    const button = e.target.closest('.page-link');
    if (!button || button.disabled) {
      return;
    }
    page = Number(button.dataset.page);
    draw();
  };
  const filter = () => {
    page = 1;
    draw();
  };

  table.tHead.addEventListener('click', click);
  pager.addEventListener('click', turn);
  search?.addEventListener('input', filter);
  draw();
  return () => {
    table.tHead.removeEventListener('click', click);
    pager.removeEventListener('click', turn);
    search?.removeEventListener('input', filter);
    pager.remove();
    body.replaceChildren(...rows);
  };
};

export { dataTable, tableRows, compareValues, nextSort, ariaSort, sortIcon, rangeText };
