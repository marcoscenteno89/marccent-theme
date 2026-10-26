// Shared: no 'use client' (no state or effects), so it renders on the server or in the browser, wherever it's used.
import { cx } from '../../lib/cx';
import '../../styles/components/board.css';

/**
 * Board: a grid_helper Grid as a game board, one square cell per grid cell in a single `.grid fixed` (cells
 * are stored row by row, the order CSS grid fills). Give each cell .square (utilities.css) to keep it square.
 * @param {import('../../lib/grid_helper').Grid} grid
 * @param {(cell: any, index: number) => React.ReactNode} children - renders one cell (give it a key)
 * @param {string} [gap] - space between cells, e.g. '2px'
 */
const Board = ({ grid, gap, className, children }) => (
  <div data-component="board" className={cx('board grid fixed', className)} style={{ '--cols': grid.cols, '--gap': gap }}>
    {grid.cells.map(children)}
  </div>
);

export { Board };
