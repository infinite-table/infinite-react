/**
 * In-page side of the grid benchmark.
 *
 * Each benchmark page provides a small `BenchAdapter` (DOM knowledge about its
 * grid) and calls `installBenchmark`. The Playwright spec only talks to
 * `window.__bench` - it never uses grid-specific selectors - so every grid
 * goes through exactly the same measuring code.
 *
 * Timing marks (`performance.mark`) end up in the Chrome trace
 * (`blink.user_timing` category), which the spec uses to find the exact
 * frame that first painted the expected content.
 */
import {
  BENCH_COLUMNS,
  BENCH_COLUMN_WIDTH,
  BENCH_GRID_HEIGHT,
  BENCH_GRID_WIDTH,
  BENCH_HEADER_HEIGHT,
  BENCH_ROW_HEIGHT,
  BenchRow,
  createRandom,
  getDataChecksum,
} from './data';
import {
  BENCH_AGGREGATE_FIELD,
  BENCH_GROUP_FIELD,
  BENCH_SORT_DIR,
  BENCH_SORT_FIELD,
  BenchView,
  driftRow,
  passesBenchFilter,
} from './updates';

export type BenchGridName = 'mui' | 'ag-grid' | 'tanstack' | 'infinite';

export type BenchRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type BenchAdapter = {
  grid: BenchGridName;
  version: string;

  /** grid root element - null before mount */
  getRoot(): HTMLElement | null;
  /** element whose native scrollTop drives the vertical scroll */
  getVerticalScroller(): HTMLElement | null;
  /** element whose native scrollLeft drives the horizontal scroll */
  getHorizontalScroller(): HTMLElement | null;
  /**
   * the visible body area (no header, no scrollbars), in client coordinates.
   * Row 0 / column 0 start at its top / left edge when scrolled to 0
   */
  getBodyRect(): BenchRect | null;
  /** attached (visible, non-pooled) cells of the given column */
  getRenderedColumnCells(field: string): HTMLElement[];
  /** attached (visible, non-pooled) cells of the given row */
  getRenderedRowCells(rowIndex: number): HTMLElement[];
  getCellRowIndex(cell: HTMLElement): number;
  getCellColumnId(cell: HTMLElement): string;
  getCell(rowIndex: number, field: string): HTMLElement | null;
  getHeaderCell(field: string): HTMLElement | null;
};

export type BenchControls = {
  mount(): void;
  isMounted(): boolean;
  /** what the grid shows - see updates.ts */
  view: BenchView;
  /**
   * gives the grid new versions of some rows, the way the grid documents
   * for changing rows (see the benchmark page of each grid)
   */
  update(rows: BenchRow[]): void;
};

/**
 * What the visible part of the grid shows after an update (or at mount),
 * in the view of the page
 */
type Expectation =
  /** `plain`, `filtered`: the rows of the viewport are these, in this order */
  | { kind: 'rows'; ids: number[] }
  /** `sorted`: the rows of the viewport are sorted, starting with `first` */
  | { kind: 'sorted'; first: string }
  /** `grouped`: one row per group, with these sums (ascending) */
  | { kind: 'groups'; sums: number[] };

type UpdatePlan = {
  /** each batch: the new versions of the rows it changes */
  batches: BenchRow[][];
  /** what the grid shows after each batch */
  expected: Expectation[];
};

type FrameRecord = {
  frames: number[];
  loaf: {
    startTime: number;
    duration: number;
    blockingDuration: number;
    scriptDuration: number;
    styleAndLayoutDuration: number;
  }[];
};

type ProbeFrame = {
  t: number;
  samples: number;
  ok: number;
  blank: number;
  wrong: number;
  /** diagnostics: the first wrong sample of the frame */
  firstWrong: string;
};

declare global {
  interface Window {
    __bench?: ReturnType<typeof createBench>;
  }
}

function cellText(cell: HTMLElement | null) {
  return cell ? (cell.textContent ?? '').trim() : null;
}

// the last row / column that is (at least mostly) visible in the
// BENCH_GRID_WIDTH x BENCH_GRID_HEIGHT box - "the whole viewport is rendered"
// checks look at these. Constants on purpose: computing them would need
// layout reads inside MutationObserver callbacks, which would add work to
// what we measure.
const LAST_ROW =
  Math.floor((BENCH_GRID_HEIGHT - BENCH_HEADER_HEIGHT - 2) / BENCH_ROW_HEIGHT) -
  1;
const LAST_COL_FIELD =
  BENCH_COLUMNS[Math.ceil((BENCH_GRID_WIDTH - 2) / BENCH_COLUMN_WIDTH) - 1]
    .field;

export type SettleInfo = {
  /** performance.now() of the last DOM mutation in the grid */
  lastMutationAt: number;
  /** mutation records seen after the content was ready */
  mutations: number;
  /** a few of the last mutations, for diagnostics */
  recent: string[];
};

// Mutations that are not the grid rendering:
//  - live regions: screen-reader announcements
//  - the footer Infinite Table shows when it has no license key: it sets its
//    own inline styles again every second, for as long as it is there
function isNotRendering(node: Node) {
  const el = node instanceof Element ? node : node.parentElement;
  return !!el?.closest(
    '[aria-live], [role="status"], [role="alert"], .Infinite-Footer',
  );
}

// An attribute written with the value it already had - e.g. a class added to
// an element that has it (NG-ZORRO Table, in the Angular benchmark, sets its
// scroll-position classes again after every change of its rows). The DOM
// reports it as a mutation, but nothing changes on screen, and no frame is
// committed for it.
function isNoOpAttributeWrite(record: MutationRecord) {
  return (
    record.type === 'attributes' &&
    record.attributeName != null &&
    record.oldValue ===
      (record.target as Element).getAttribute(record.attributeName)
  );
}

function describeMutation(record: MutationRecord) {
  const target = record.target as Element;
  const cls =
    typeof target.className === 'string'
      ? target.className.split(' ').slice(0, 2).join('.')
      : target.nodeName;
  return `${record.type}:${cls}${
    record.attributeName ? `[${record.attributeName}]` : ''
  }`;
}

function createBench(
  adapter: BenchAdapter,
  controls: BenchControls,
  data: BenchRow[],
  dataGenerationTime: number,
) {
  let frameRecorder: { stop(): FrameRecord } | null = null;
  /**
   * the rows as they are now, by id - a copy of `data`, which the updates
   * change. The checks compare the grid with it. A copy from the start, made
   * before anything is measured, because a grid may reorder the array it is
   * given (PrimeNG Table, in the Angular benchmark, sorts it in place).
   */
  const truth = data.slice();
  let plan: UpdatePlan | null = null;
  let probe: { stop(): ProbeFrame[] } | null = null;
  let checksum: string | null = null;

  const getScrollPosition = () => ({
    scrollTop: adapter.getVerticalScroller()?.scrollTop ?? 0,
    scrollLeft: adapter.getHorizontalScroller()?.scrollLeft ?? 0,
  });

  /**
   * px of row content scrolled out above the body, for a native scrollTop.
   *
   * Browsers cap element heights (~33.5M px in Chrome) and 1M rows x 40px is
   * more than that, so grids map the scrollbar onto the rows linearly
   * (AG Grid "stretches"). The linear mapping is exact when there's no
   * stretching (ratio 1) and matches AG Grid's when there is.
   *
   * It is only the fallback: a grid that doesn't map the scrollbar at all
   * (and so can't reach its last rows) has a ratio of 1 whatever the scroll
   * range is - the spec gives each page the ratio measured by
   * calibrateScroll() (see setScrollRatio).
   */
  const getLinearScrollRatio = () => {
    const scroller = adapter.getVerticalScroller();
    const body = adapter.getBodyRect();
    if (!scroller || !body) {
      return 1;
    }
    const scrollMax = scroller.scrollHeight - scroller.clientHeight;
    const contentMax = data.length * BENCH_ROW_HEIGHT - body.height;
    return scrollMax > 0 ? contentMax / scrollMax : 1;
  };
  // set by calibrateScroll() / setScrollRatio() - the grid's own
  // scrollTop -> row mapping
  let calibratedRatio: number | null = null;

  const getContentOffset = (scrollTop?: number) => {
    const top = scrollTop ?? adapter.getVerticalScroller()?.scrollTop ?? 0;
    return top * (calibratedRatio ?? getLinearScrollRatio());
  };

  /** first & last row (index) visible in the body, from the id column */
  const getVisibleRowRange = () => {
    const body = adapter.getBodyRect();
    if (!body) {
      return null;
    }
    const cells = adapter
      .getRenderedColumnCells('id')
      .map((cell) => ({
        index: Number(cellText(cell)) - 1,
        top: cell.getBoundingClientRect().top,
      }))
      .filter((c) => c.top >= body.top - 1 && c.top < body.top + body.height)
      .sort((a, b) => a.top - b.top);
    if (!cells.length) {
      return null;
    }
    return {
      first: cells[0],
      last: cells[cells.length - 1],
      bodyTop: body.top,
    };
  };

  // --- "settled" tracking: after the content is ready, keep recording DOM
  // mutations in the grid until the next measurement starts (or the spec
  // asks for the result). The spec maps the last mutation into the trace and
  // takes the first frame committed after it.
  let activeSettle: {
    label: string;
    observer: MutationObserver;
    info: SettleInfo;
  } | null = null;
  const settleResults = new Map<string, SettleInfo>();

  function stopSettle() {
    if (activeSettle) {
      activeSettle.observer.disconnect();
      settleResults.set(activeSettle.label, activeSettle.info);
      activeSettle = null;
    }
  }

  function startSettle(label: string, readyAt: number) {
    stopSettle();
    const info: SettleInfo = {
      lastMutationAt: readyAt,
      mutations: 0,
      recent: [],
    };
    const observer = new MutationObserver((all) => {
      const records = all.filter(
        (r) => !isNotRendering(r.target) && !isNoOpAttributeWrite(r),
      );
      if (!records.length) {
        return;
      }
      info.lastMutationAt = performance.now();
      info.mutations += records.length;
      for (const r of records.slice(-3)) {
        info.recent.push(describeMutation(r));
      }
      info.recent = info.recent.slice(-6);
    });
    observer.observe(adapter.getRoot() ?? document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeOldValue: true,
    });
    activeSettle = { label, observer, info };
  }

  /**
   * Resolves once `isReady()` returns true. The check runs in a
   * MutationObserver callback (so right after the grid mutated the DOM, in
   * the same task / rAF callback that did the mutation) and when it first
   * passes, `bench:dom-ready:<label>` is marked.
   *
   * The spec then looks up, in the Chrome trace, the first frame committed
   * after that mark - that is when the user could first see the content.
   */
  function waitForDOM(
    label: string,
    isReady: () => boolean,
    timeout = 30_000,
  ): Promise<{ domReadyAt: number }> {
    stopSettle();
    return new Promise((resolve, reject) => {
      let done = false;
      const finish = () => {
        if (done) {
          return;
        }
        done = true;
        observer.disconnect();
        clearTimeout(timer);
        const domReadyAt = performance.now();
        performance.mark(`bench:dom-ready:${label}`);
        startSettle(label, domReadyAt);
        // no rAF / timers here: anything we schedule would show up in the
        // trace as main-thread work
        resolve({ domReadyAt });
      };
      const observer = new MutationObserver(() => {
        if (isReady()) {
          finish();
        }
      });
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
      });
      const timer = setTimeout(() => {
        if (done) {
          return;
        }
        done = true;
        observer.disconnect();
        reject(new Error(`Timeout waiting for DOM: ${label}`));
      }, timeout);
      if (isReady()) {
        finish();
      }
    });
  }

  const isCellCorrect = (rowIndex: number, field: string, expected: string) =>
    cellText(adapter.getCell(rowIndex, field)) === expected;

  /** row `rowIndex` shows data row `dataIndex` - checks first & last visible column */
  const isRowCorrect = (rowIndex: number, dataIndex: number) => {
    const row = truth[dataIndex];
    return (
      !!row &&
      isCellCorrect(rowIndex, 'id', String(row.id)) &&
      isCellCorrect(rowIndex, LAST_COL_FIELD, String(row[LAST_COL_FIELD]))
    );
  };

  /**
   * every visible row is rendered, is internally consistent (its cells
   * belong to the same data row) and the `field` column is sorted
   */
  const isSorted = (field: keyof BenchRow, dir: 1 | -1, first: string) => {
    if (!isCellCorrect(0, field, first)) {
      return false;
    }
    let prev: string | number | null = null;
    for (let r = 0; r <= LAST_ROW; r++) {
      const id = Number(cellText(adapter.getCell(r, 'id')));
      const row = truth[id - 1];
      if (!row || !isRowCorrect(r, id - 1)) {
        return false;
      }
      if (cellText(adapter.getCell(r, field)) !== String(row[field])) {
        return false;
      }
      const value = row[field];
      if (prev !== null && (dir === 1 ? value < prev : value > prev)) {
        return false;
      }
      prev = value;
    }
    return true;
  };

  // --- views and updates (see updates.ts) --------------------------------

  /** rows in the viewport, which the checks look at */
  const VIEWPORT_ROWS = LAST_ROW + 1;

  /** row `rowIndex` shows `row` as it is now - id, last column and the updated salary */
  const isRowShowing = (rowIndex: number, row: BenchRow) =>
    isCellCorrect(rowIndex, 'id', String(row.id)) &&
    isCellCorrect(rowIndex, 'salary', String(row.salary)) &&
    isCellCorrect(rowIndex, LAST_COL_FIELD, String(row[LAST_COL_FIELD]));

  /** the first rows that pass the filter, in the order of the data */
  const firstFilteredIds = (rows: BenchRow[]) => {
    const ids: number[] = [];
    for (let i = 0; i < rows.length && ids.length < VIEWPORT_ROWS; i++) {
      if (passesBenchFilter(rows[i])) {
        ids.push(rows[i].id);
      }
    }
    return ids;
  };

  /** the rows with the highest salary, highest first */
  const topSortedRows = (rows: BenchRow[]) => {
    const top: BenchRow[] = [];
    const field = BENCH_SORT_FIELD;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (
        top.length === VIEWPORT_ROWS &&
        row[field] <= top[VIEWPORT_ROWS - 1][field]
      ) {
        continue;
      }
      let at = top.length;
      while (at > 0 && top[at - 1][field] < row[field]) {
        at--;
      }
      top.splice(at, 0, row);
      if (top.length > VIEWPORT_ROWS) {
        top.pop();
      }
    }
    return top;
  };

  const groupSums = (rows: BenchRow[]) => {
    const sums = new Map<string, number>();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const key = row[BENCH_GROUP_FIELD];
      sums.set(key, (sums.get(key) ?? 0) + row[BENCH_AGGREGATE_FIELD]);
    }
    return sums;
  };
  const sortedSums = (sums: Map<string, number>) =>
    Array.from(sums.values()).sort((a, b) => a - b);

  /** what the grid shows for `rows`, in the view of the page */
  const getExpectation = (rows: BenchRow[]): Expectation => {
    switch (controls.view) {
      case 'plain':
        return {
          kind: 'rows',
          ids: rows.slice(0, VIEWPORT_ROWS).map((row) => row.id),
        };
      case 'filtered':
        return { kind: 'rows', ids: firstFilteredIds(rows) };
      case 'sorted':
        return {
          kind: 'sorted',
          first: String(topSortedRows(rows)[0][BENCH_SORT_FIELD]),
        };
      case 'grouped':
        return { kind: 'groups', sums: sortedSums(groupSums(rows)) };
    }
  };

  /**
   * The grid shows `expected`, with the values of `truth`. Before an update
   * is rendered this is false: every update changes the salary of all the
   * rows in the viewport (and of every group)
   */
  const isShowing = (expected: Expectation) => {
    switch (expected.kind) {
      case 'rows':
        return expected.ids.every((id, r) => isRowShowing(r, truth[id - 1]));
      case 'sorted':
        return isSorted(BENCH_SORT_FIELD, BENCH_SORT_DIR, expected.first);
      case 'groups': {
        const shown: number[] = [];
        for (let r = 0; r < expected.sums.length; r++) {
          const text = cellText(adapter.getCell(r, BENCH_AGGREGATE_FIELD));
          if (!text) {
            return false;
          }
          shown.push(Number(text));
        }
        shown.sort((a, b) => a - b);
        // the grids add the salaries in different orders, and the float sums
        // differ by a tiny bit - an update changes them by much more
        return shown.every((sum, i) => Math.abs(sum - expected.sums[i]) < 0.5);
      }
    }
  };

  const applyBatch = (index: number) => {
    const batch = plan!.batches[index];
    for (let i = 0; i < batch.length; i++) {
      truth[batch[i].id - 1] = batch[i];
    }
    return batch;
  };

  return {
    grid: adapter.grid,
    version: adapter.version,

    env: process.env.NODE_ENV,
    dev: typeof __DEV__ !== 'undefined' ? __DEV__ : null,
    rowCount: data.length,
    view: controls.view,
    dataGenerationTime,
    rowHeight: BENCH_ROW_HEIGHT,
    columnWidth: BENCH_COLUMN_WIDTH,
    columns: BENCH_COLUMNS.map((c) => c.field),

    getChecksum() {
      if (!checksum) {
        checksum = getDataChecksum(data);
      }
      return checksum;
    },

    isMounted: controls.isMounted,

    /**
     * Mounts the grid with all rows and resolves when the whole viewport
     * (first & last visible row, first & last visible column) shows the
     * right content.
     */
    async mount() {
      const expected =
        controls.view === 'plain' ? null : getExpectation(truth);
      const ready = waitForDOM('mount', () =>
        expected
          ? isShowing(expected)
          : isRowCorrect(0, 0) && isRowCorrect(LAST_ROW, LAST_ROW),
      );
      performance.mark('bench:start:mount');
      const startAt = performance.now();
      controls.mount();
      const res = await ready;
      return { startAt, ...res };
    },

    /**
     * The value expected in the first row after sorting `field` - computed
     * with a linear scan (min/max, first occurrence wins, like a stable sort)
     * so it's cheap and independent of either grid's comparator.
     */
    getExpectedFirstValue(field: keyof BenchRow, dir: 1 | -1) {
      let best = truth[0][field];
      for (let i = 1; i < truth.length; i++) {
        const value = truth[i][field];
        if (dir === 1 ? value < best : value > best) {
          best = value;
        }
      }
      return String(best);
    },

    /**
     * Arms the input-latency measurement: on the next pointerdown (capture
     * phase, before any grid handler) `bench:start:<label>` is marked, then
     * we wait until all visible rows are sorted by `field`, starting with
     * `first`.
     */
    armInteraction(
      label: string,
      field: keyof BenchRow,
      dir: 1 | -1,
      first: string,
    ) {
      const result = new Promise<{
        startAt: number;
        domReadyAt: number;
      }>((resolve, reject) => {
        const onPointerDown = (event: PointerEvent) => {
          window.removeEventListener('pointerdown', onPointerDown, true);
          performance.mark(`bench:start:${label}`);
          const startAt = event.timeStamp;
          waitForDOM(label, () => isSorted(field, dir, first)).then(
            (res) => resolve({ startAt, ...res }),
            reject,
          );
        };
        window.addEventListener('pointerdown', onPointerDown, true);
      });
      (window as any).__benchInteraction = result;
    },
    async awaitInteraction() {
      return (window as any).__benchInteraction;
    },

    /** ends the current measurement window (stops "settled" tracking) */
    markIdle() {
      stopSettle();
      performance.mark('bench:start:idle');
    },

    /** DOM mutations after `label` was ready - stops tracking `label` */
    getSettleInfo(label: string): SettleInfo | null {
      if (activeSettle?.label === label) {
        stopSettle();
      }
      return settleResults.get(label) ?? null;
    },

    /**
     * Works out `batches` updates, before anything is measured: each one
     * changes `rowsPerBatch` random rows and all the rows in the viewport (so
     * every update changes what is on screen), by drifting their numbers
     * (see driftRow). The same seed gives every grid the same updates. Also
     * works out what the grid shows after each of them.
     */
    prepareUpdates(batches: number, rowsPerBatch: number, seed = 7) {
      const random = createRandom(seed);
      const rows = truth.slice();
      const count = rows.length;
      let sums = controls.view === 'grouped' ? groupSums(rows) : null;
      // the rows in the viewport now
      let inView: number[] =
        controls.view === 'plain'
          ? rows.slice(0, VIEWPORT_ROWS).map((row) => row.id)
          : controls.view === 'filtered'
            ? firstFilteredIds(rows)
            : controls.view === 'sorted'
              ? topSortedRows(rows).map((row) => row.id)
              : [];

      const result: UpdatePlan = { batches: [], expected: [] };
      for (let b = 0; b < batches; b++) {
        const ids = new Set(inView);
        while (ids.size < inView.length + rowsPerBatch) {
          ids.add(1 + Math.floor(random() * count));
        }
        const batch: BenchRow[] = [];
        for (const id of ids) {
          const old = rows[id - 1];
          const row = driftRow(old, random);
          rows[id - 1] = row;
          batch.push(row);
          if (sums) {
            const key = row[BENCH_GROUP_FIELD];
            sums.set(
              key,
              sums.get(key)! +
                row[BENCH_AGGREGATE_FIELD] -
                old[BENCH_AGGREGATE_FIELD],
            );
          }
        }
        result.batches.push(batch);

        let expected: Expectation;
        if (controls.view === 'sorted') {
          const top = topSortedRows(rows);
          expected = { kind: 'sorted', first: String(top[0][BENCH_SORT_FIELD]) };
          inView = top.map((row) => row.id);
        } else if (sums) {
          expected = { kind: 'groups', sums: sortedSums(sums) };
        } else {
          expected = getExpectation(rows);
          inView = (expected as { ids: number[] }).ids;
        }
        result.expected.push(expected);
      }
      plan = result;
      return {
        batches: result.batches.length,
        rowsChanged: result.batches.reduce((sum, b) => sum + b.length, 0),
      };
    },

    /**
     * Sends update `index` to the grid and resolves when the viewport shows
     * it (see isShowing)
     */
    async pushUpdate(label: string, index: number) {
      if (!plan) {
        throw new Error('prepareUpdates() first');
      }
      const batch = applyBatch(index);
      const expected = plan.expected[index];
      const ready = waitForDOM(label, () => isShowing(expected));
      performance.mark(`bench:start:${label}`);
      const startAt = performance.now();
      controls.update(batch);
      const res = await ready;
      return { startAt, ...res };
    },

    /**
     * A live feed: the updates arrive one every `intervalMs`, and the page
     * hands them to the grid once per animation frame - all those that
     * arrived since the previous frame, as one update (the way an app
     * buffers the messages of a socket). A grid that keeps the main thread
     * busy gets the updates later, and more of them at once.
     *
     * Resolves when the viewport shows the last update. `bench:start:<label>`
     * is when the first update arrives; the last one arrives
     * (batches - 1) × intervalMs later.
     */
    runUpdateStream(label: string, intervalMs: number) {
      if (!plan) {
        throw new Error('prepareUpdates() first');
      }
      const { batches, expected } = plan;
      const delays: number[] = [];
      return new Promise<{
        startAt: number;
        domReadyAt: number;
        /** ms between an update arriving and the grid getting it */
        delays: number[];
        /** how many times the grid was given updates */
        flushes: number;
      }>((resolve, reject) => {
        performance.mark(`bench:start:${label}`);
        const startAt = performance.now();
        let next = 0;
        let flushes = 0;
        const flush = () => {
          const now = performance.now();
          const due = Math.min(
            batches.length,
            Math.floor((now - startAt) / intervalMs) + 1,
          );
          if (due > next) {
            const merged = new Map<number, BenchRow>();
            for (; next < due; next++) {
              delays.push(now - (startAt + next * intervalMs));
              for (const row of applyBatch(next)) {
                merged.set(row.id, row);
              }
            }
            flushes++;
            const rows = Array.from(merged.values());
            if (next === batches.length) {
              waitForDOM(label, () =>
                isShowing(expected[batches.length - 1]),
                60_000,
              ).then(
                (res) => resolve({ startAt, ...res, delays, flushes }),
                reject,
              );
              controls.update(rows);
              return;
            }
            controls.update(rows);
          }
          requestAnimationFrame(flush);
        };
        flush();
      });
    },

    getHeaderCellCenter(field: string) {
      const cell = adapter.getHeaderCell(field);
      if (!cell) {
        throw new Error(`No header cell for ${field}`);
      }
      const rect = cell.getBoundingClientRect();
      return {
        // stay away from the right edge - resize handles & menus live there
        x: rect.left + Math.min(40, rect.width / 3),
        y: rect.top + rect.height / 2,
      };
    },

    getBodyRect() {
      const rect = adapter.getBodyRect();
      if (!rect) {
        throw new Error('No body rect');
      }
      return rect;
    },

    getScrollPosition,
    getContentOffset,

    /**
     * Measures how the grid maps the scrollbar onto rows (scroll to the
     * middle, see which row is at the top) and whether the last row can be
     * reached at all (scroll to the end). Leaves the grid scrolled to 0.
     *
     * The probes / jumps then use the grid's own mapping, so they measure
     * rendering lag - not mapping differences. Reachability is reported
     * separately. Call it before (unsorted) measurements only.
     */
    async calibrateScroll() {
      const scroller = adapter.getVerticalScroller();
      if (!scroller) {
        throw new Error('No scroller');
      }
      const wait = () => new Promise((resolve) => setTimeout(resolve, 400));
      const scrollMax = scroller.scrollHeight - scroller.clientHeight;
      const linearRatio = getLinearScrollRatio();

      const middle = Math.round(scrollMax / 2);
      scroller.scrollTop = middle;
      await wait();
      const atMiddle = getVisibleRowRange();
      scroller.scrollTop = scrollMax;
      await wait();
      const atEnd = getVisibleRowRange();
      scroller.scrollTop = 0;
      await wait();

      if (!atMiddle || !atEnd) {
        throw new Error('Calibration: no rows visible');
      }
      const offset =
        atMiddle.first.index * BENCH_ROW_HEIGHT +
        (atMiddle.bodyTop - atMiddle.first.top);
      calibratedRatio = offset / middle;
      return {
        ratio: calibratedRatio,
        linearRatio,
        scrollMax,
        lastVisibleRow: atEnd.last.index + 1,
        rowCount: data.length,
      };
    },

    /**
     * the scrollTop -> row mapping measured by calibrateScroll() on another
     * page of the same grid, with the same rows
     */
    setScrollRatio(ratio: number) {
      calibratedRatio = ratio;
    },

    getScrollMax() {
      const v = adapter.getVerticalScroller();
      const h = adapter.getHorizontalScroller();
      return {
        scrollTopMax: v ? v.scrollHeight - v.clientHeight : 0,
        scrollLeftMax: h ? h.scrollWidth - h.clientWidth : 0,
      };
    },

    /** text of the visible cells (first `count` rows) - for parity checks */
    getVisibleTexts(count: number) {
      const lastCol = BENCH_COLUMNS.findIndex(
        (c) => c.field === LAST_COL_FIELD,
      );
      const rows: (string | null)[][] = [];
      for (let r = 0; r < count; r++) {
        rows.push(
          BENCH_COLUMNS.slice(0, lastCol + 1).map((c) =>
            cellText(adapter.getCell(r, c.field)),
          ),
        );
      }
      return rows;
    },

    /**
     * Programmatic jump (like dragging the scrollbar thumb far away) -
     * resolves when the rows that should be in the viewport are rendered,
     * with the right content, at the right position.
     */
    async jumpTo(label: string, scrollTop: number) {
      const scroller = adapter.getVerticalScroller();
      const body = adapter.getBodyRect();
      if (!scroller || !body) {
        throw new Error('No scroller');
      }
      const offset = getContentOffset(scrollTop);
      // first fully visible row, and the last one
      const firstRow = Math.ceil(offset / BENCH_ROW_HEIGHT);
      const lastRow = firstRow + LAST_ROW - 1;
      const expectedTop = body.top + firstRow * BENCH_ROW_HEIGHT - offset;

      const ready = waitForDOM(label, () => {
        if (
          !isRowCorrect(firstRow, firstRow) ||
          !isRowCorrect(lastRow, lastRow)
        ) {
          return false;
        }
        const cell = adapter.getCell(firstRow, 'id')!;
        // a few px of slack for the rounding of stretched scrolling
        return Math.abs(cell.getBoundingClientRect().top - expectedTop) <= 4;
      });
      performance.mark(`bench:start:${label}`);
      const startAt = performance.now();
      scroller.scrollTop = scrollTop;
      const res = await ready;
      return { startAt, ...res };
    },

    /**
     * Records rAF timestamps + Long Animation Frames until stopped.
     * Keep this free of DOM reads so it does not disturb what it measures.
     */
    startFrameRecorder() {
      const frames: number[] = [];
      const loaf: FrameRecord['loaf'] = [];
      let running = true;
      const tick = (t: number) => {
        if (!running) {
          return;
        }
        frames.push(t);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      let observer: PerformanceObserver | null = null;
      try {
        observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            loaf.push({
              startTime: entry.startTime,
              duration: entry.duration,
              blockingDuration: entry.blockingDuration ?? 0,
              scriptDuration: (entry.scripts ?? []).reduce(
                (sum: number, s: any) => sum + s.duration,
                0,
              ),
              styleAndLayoutDuration: entry.styleAndLayoutStart
                ? entry.startTime + entry.duration - entry.styleAndLayoutStart
                : 0,
            });
          }
        });
        observer.observe({ type: 'long-animation-frame', buffered: false });
      } catch (ex) {
        // LoAF not supported
      }

      frameRecorder = {
        stop() {
          running = false;
          if (observer) {
            for (const entry of observer.takeRecords() as any[]) {
              loaf.push({
                startTime: entry.startTime,
                duration: entry.duration,
                blockingDuration: entry.blockingDuration ?? 0,
                scriptDuration: 0,
                styleAndLayoutDuration: 0,
              });
            }
            observer.disconnect();
          }
          return { frames, loaf };
        },
      };
    },
    stopFrameRecorder(): FrameRecord {
      if (!frameRecorder) {
        throw new Error('Frame recorder not started');
      }
      const res = frameRecorder.stop();
      frameRecorder = null;
      return res;
    },

    /**
     * Visual-correctness probe: after every frame is painted, samples points
     * across the body viewport and checks that the cell at each point is
     * the one that *should* be there given the scroll position (see
     * getContentOffset):
     *   - 'vertical': samples every 8px down the first (id) column
     *   - 'horizontal': samples every 8px across one row
     * A sample is `blank` when no cell covers it, `wrong` when the cell is
     * for another row/column (stale content or position lagging the scroll).
     *
     * It reads layout, so it's never combined with the timing passes.
     */
    startProbe(axis: 'vertical' | 'horizontal') {
      const records: ProbeFrame[] = [];
      let running = true;
      const STEP = 8;

      const measure = () => {
        const body = adapter.getBodyRect();
        if (!body) {
          return;
        }
        const bodyRect = {
          left: body.left,
          top: body.top,
          right: body.left + body.width,
          bottom: body.top + body.height,
        };
        const { scrollLeft } = getScrollPosition();
        const offset = getContentOffset();
        let samples = 0;
        let ok = 0;
        let blank = 0;
        let wrong = 0;
        let firstWrong = '';

        if (axis === 'vertical') {
          const cells = adapter
            .getRenderedColumnCells('id')
            .map((cell) => ({ cell, rect: cell.getBoundingClientRect() }));
          const x = bodyRect.left + 20;
          const rowAt = (y: number) =>
            Math.floor((offset + y - bodyRect.top) / BENCH_ROW_HEIGHT);
          for (let y = bodyRect.top + 2; y < bodyRect.bottom - 2; y += STEP) {
            samples++;
            const hit = cells.find(
              ({ rect }) =>
                rect.top <= y &&
                y < rect.bottom &&
                rect.left <= x &&
                x < rect.right,
            );
            if (!hit) {
              blank++;
              continue;
            }
            const text = cellText(hit.cell);
            // a few px of slack for the rounding of stretched scrolling
            const isRight = [rowAt(y), rowAt(y - 3), rowAt(y + 3)].some(
              (r) => r >= 0 && r < truth.length && text === String(truth[r].id),
            );
            if (isRight) {
              ok++;
            } else {
              wrong++;
              if (!firstWrong) {
                firstWrong = `y=${Math.round(y - bodyRect.top)} expected id ${
                  truth[rowAt(y)]?.id
                }, got ${text}`;
              }
            }
          }
        } else {
          // the 6th row from the top of the viewport
          const rowIndex = Math.floor(offset / BENCH_ROW_HEIGHT) + 5;
          const rowTop = bodyRect.top + rowIndex * BENCH_ROW_HEIGHT - offset;
          const y = rowTop + BENCH_ROW_HEIGHT / 2;
          const cells = adapter
            .getRenderedRowCells(rowIndex)
            .map((cell) => ({ cell, rect: cell.getBoundingClientRect() }));
          for (let x = bodyRect.left + 2; x < bodyRect.right - 2; x += STEP) {
            samples++;
            const colIndex = Math.floor(
              (scrollLeft + x - bodyRect.left) / BENCH_COLUMN_WIDTH,
            );
            const column = BENCH_COLUMNS[colIndex];
            const hit = cells.find(
              ({ rect }) =>
                rect.left <= x &&
                x < rect.right &&
                rect.top <= y &&
                y < rect.bottom,
            );
            if (!hit) {
              blank++;
            } else if (
              column &&
              adapter.getCellColumnId(hit.cell) === column.field &&
              cellText(hit.cell) === String(truth[rowIndex][column.field])
            ) {
              ok++;
            } else {
              wrong++;
              if (!firstWrong) {
                firstWrong = `x=${Math.round(x - bodyRect.left)} expected ${
                  column?.field
                }, got ${adapter.getCellColumnId(hit.cell)}`;
              }
            }
          }
        }
        records.push({
          t: performance.now(),
          samples,
          ok,
          blank,
          wrong,
          firstWrong,
        });
      };

      const channel = new MessageChannel();
      channel.port1.onmessage = measure;
      const tick = () => {
        if (!running) {
          return;
        }
        // measure right after this frame is painted
        channel.port2.postMessage(null);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      probe = {
        stop() {
          running = false;
          channel.port1.close();
          return records;
        },
      };
    },
    stopProbe(): ProbeFrame[] {
      if (!probe) {
        throw new Error('Probe not started');
      }
      const res = probe.stop();
      probe = null;
      return res;
    },

    /** number of DOM elements inside the grid */
    getGridElementCount() {
      return adapter.getRoot()?.querySelectorAll('*').length ?? 0;
    },
  };
}

export type Bench = ReturnType<typeof createBench>;

export function installBenchmark(
  adapter: BenchAdapter,
  controls: BenchControls,
  data: BenchRow[],
  dataGenerationTime: number,
) {
  window.__bench = createBench(adapter, controls, data, dataGenerationTime);
  return () => {
    delete window.__bench;
  };
}
