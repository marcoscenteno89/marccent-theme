'use client';
import { useState } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from './icon';
import { Input } from './field';
import { Pagination } from './pagination';
import { tableRows, nextSort, ariaSort, sortIcon, rangeText } from '../../core/data-table';
import '../../styles/components/table.css';

/**
 * DataTable: a table of rows you can filter (a search box), sort (click a header: ascending, descending, back to the
 * original order) and page through (Pagination under it). Numbers sort as numbers, text in the reader's language. A
 * status line says which rows show, and screen readers hear it change. Wide tables scroll sideways in their border.
 * The rules live in core/data-table.js, shared with the plain-JS engine.
 *
 * @param {Object} props
 * @param {{ key: string, label: string, sortable?: boolean, filter?: boolean, align?: 'start'|'end'|'center',
 *   render?: (row: Object) => React.ReactNode, value?: (row: Object) => any }[]} props.columns - key: the row's field.
 *   sortable, filter: whether the column sorts and is searched (both default true). render: the cell's content
 *   (default the value). value: what it sorts and filters by (default row[key]).
 * @param {Object[]} props.rows - Give each an id when you have one (the row's key).
 * @param {string} props.label - The table's name (its caption, for screen readers).
 * @param {number} [props.pageSize=10] - Rows per page; 0 shows them all.
 * @param {boolean} [props.search=true] - The filter box.
 * @param {string} [props.className] - Extra classes on the whole widget.
 *
 * @example
 * <DataTable label="Team" rows={people} columns={[
 *   { key: 'name', label: 'Name' },
 *   { key: 'age', label: 'Age', align: 'end' },
 *   { key: 'email', label: 'Email', sortable: false, render: (p) => <a href={`mailto:${p.email}`}>{p.email}</a> },
 * ]} />
 */
const DataTable = ({ columns, rows, label, pageSize = 10, search = true, className }) => {
  const [ query, setQuery ] = useState('');
  const [ sort, setSort ] = useState(null);
  const [ page, setPage ] = useState(1);

  const value = (row, key) => {
    const column = columns.find((c) => c.key === key);
    return column?.value ? column.value(row) : row[key];
  };
  const keys = columns.filter((c) => c.filter !== false).map((c) => c.key);
  const shown = tableRows(rows, { query, value, keys, sort });
  const size = pageSize || shown.length || 1;
  const pages = Math.max(1, Math.ceil(shown.length / size));
  const current = Math.min(page, pages);
  const visible = shown.slice((current - 1) * size, current * size);

  const filter = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  return (
    <div data-component="data-table" data-page-size={pageSize || undefined} className={cx('grid cols-1 gap-sm', className)}>
      {search && <Input name="filter" type="search" label={`Filter ${label.toLowerCase()}`} value={query} onChange={filter} />}
      <div className="overflow-auto border round">
        <table className="table">
          <caption className="visually-hidden">{label}</caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" aria-sort={ariaSort(sort, c.key)} className={c.align && `text-${c.align}`}>
                  {c.sortable === false ? c.label : (
                    <button type="button" data-component="button" data-name={c.key} className="sort-button"
                      onClick={() => setSort(nextSort(sort, c.key))}>
                      {c.label}
                      <Icon name={sortIcon(sort, c.key)} />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={row.id ?? `${current}-${i}`}>
                {columns.map((c) => (
                  <td key={c.key} data-value={value(row, c.key)} className={c.align && `text-${c.align}`}>
                    {c.render ? c.render(row) : value(row, c.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageSize > 0 && pages > 1 && (
        <Pagination total={shown.length} pageSize={size} current={current} update={setPage} className="divide border round" />
      )}
      <p aria-live="polite" className="fs-sm opacity-75">{rangeText(current, size, shown.length)}</p>
    </div>
  );
};

export { DataTable };
