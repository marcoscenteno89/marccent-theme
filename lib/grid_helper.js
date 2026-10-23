/*
 * Grid helper: a rows × cols board of cells for games, charts, anything laid out on a grid. Plain JS (no React,
 * no browser APIs), so server and client components can both use it; it could move to @marccent/util as is.
 *
 * Cells are whatever objects you make; the Grid only places them. They are stored row by row (row-major), the
 * order CSS grid places children, so `grid.cells` renders straight into a `.grid fixed` board with
 * `--cols: grid.cols`. Positions are always (row, col); out-of-bounds lookups return undefined, never throw.
 */

// Neighbour offsets as [row, col]: the 4 sides, or all 8 cells around.
const SIDES = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const AROUND = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

class Grid {
  /**
   * @param {number} rows @param {number} cols
   * @param {(row: number, col: number, index: number) => any} [make] - builds each cell; default {}
   */
  constructor(rows, cols, make = () => ({})) {
    this.rows = rows;
    this.cols = cols;
    this.cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) this.cells.push(make(row, col, this.cells.length));
    }
  }

  get size() { return this.cells.length; }

  has(row, col) { return row >= 0 && row < this.rows && col >= 0 && col < this.cols; }

  get(row, col) { return this.has(row, col) ? this.cells[row * this.cols + col] : undefined; }

  set(row, col, cell) { if (this.has(row, col)) this.cells[row * this.cols + col] = cell; }

  /** Row and column of the cell at `index` in `cells`. */
  position(index) { return { row: Math.floor(index / this.cols), col: index % this.cols }; }

  /**
   * The cells next to (row, col): all 8 around it, or only the 4 sides with { diagonal: false }.
   * Positions past the edge are skipped.
   */
  neighbors(row, col, { diagonal = true } = {}) {
    const result = [];
    for (const [ dr, dc ] of diagonal ? AROUND : SIDES) {
      if (this.has(row + dr, col + dc)) result.push(this.cells[(row + dr) * this.cols + col + dc]);
    }
    return result;
  }

  forEach(fn) { this.cells.forEach((cell, i) => fn(cell, Math.floor(i / this.cols), i % this.cols)); }

  filter(test) { return this.cells.filter(test); }

  find(test) { return this.cells.find(test); }

  count(test) { return this.cells.reduce((n, cell) => n + (test(cell) ? 1 : 0), 0); }

  /**
   * Up to `n` different random cells that pass `test` (all cells by default), e.g. where to put the mines.
   * @param {() => number} [random] - a 0-1 random function
   */
  sample(n, test = () => true, random = Math.random) {
    return shuffle(this.filter(test), random).slice(0, n);
  }

  /**
   * Everything reachable from (row, col): the start cell, then the neighbours of every reached cell that
   * `spread` says spreads, e.g. Minesweeper's reveal (empty cells open up their neighbours, numbered ones
   * stop there). Each cell is visited once.
   * @param {(cell) => boolean} spread - whether a reached cell passes the fill on to its neighbours
   * @param {Object} [opts] @param {(cell) => boolean} [opts.enter] - neighbours that may be reached at all
   * @param {boolean} [opts.diagonal=true]
   * @returns {Array} reached cells, start first
   */
  floodFill(row, col, spread, { enter = () => true, diagonal = true } = {}) {
    const start = this.get(row, col);
    if (start === undefined) return [];
    const seen = new Set([ row * this.cols + col ]);
    const reached = [ start ];
    const queue = [ [ row, col ] ];
    while (queue.length) {
      const [ r, c ] = queue.shift();
      if (!spread(this.cells[r * this.cols + c])) continue;
      for (const [ dr, dc ] of diagonal ? AROUND : SIDES) {
        const nr = r + dr;
        const nc = c + dc;
        const index = nr * this.cols + nc;
        if (!this.has(nr, nc) || seen.has(index) || !enter(this.cells[index])) continue;
        seen.add(index);
        reached.push(this.cells[index]);
        queue.push([ nr, nc ]);
      }
    }
    return reached;
  }

  /**
   * The cell position under a point on an area `width` × `height` px that the grid covers evenly (a canvas, a
   * chart), clamped to the edge cells. For pointer hit tests.
   */
  cellAt(x, y, width, height) {
    return {
      row: Math.min(this.rows - 1, Math.max(0, Math.floor(y / (height / this.rows)))),
      col: Math.min(this.cols - 1, Math.max(0, Math.floor(x / (width / this.cols))))
    };
  }
}

/**
 * Shuffles `array` in place, every order equally likely (Fisher-Yates; `sort(() => Math.random() - 0.5)` is
 * biased). Returns the array.
 * @param {() => number} [random] - a 0-1 random function
 */
const shuffle = (array, random = Math.random) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [ array[i], array[j] ] = [ array[j], array[i] ];
  }
  return array;
}

export { Grid, shuffle };
