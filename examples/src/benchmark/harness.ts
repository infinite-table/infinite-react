/**
 * In-page side of the AG Grid vs Infinite Table benchmark.
 *
 * Each benchmark page provides a small `BenchAdapter` (DOM knowledge about its
 * grid) and calls `installBenchmark`. The Playwright spec only talks to
 * `window.__bench` - it never uses grid-specific selectors - so both grids go
 * through exactly the same measuring code.
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
  getDataChecksum,
} from './data';

export type BenchGridName = 'ag-grid' | 'infinite';

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
  // set by calibrateScroll() - the grid's own scrollTop -> row mapping
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
      const records = all.filter((r) => !isNotRendering(r.target));
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
    const row = data[dataIndex];
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
      const row = data[id - 1];
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

  return {
    grid: adapter.grid,
    version: adapter.version,
    env: process.env.NODE_ENV,
    dev: typeof __DEV__ !== 'undefined' ? __DEV__ : null,
    rowCount: data.length,
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
      const ready = waitForDOM(
        'mount',
        () => isRowCorrect(0, 0) && isRowCorrect(LAST_ROW, LAST_ROW),
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
      let best = data[0][field];
      for (let i = 1; i < data.length; i++) {
        const value = data[i][field];
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
              (r) => r >= 0 && r < data.length && text === String(data[r].id),
            );
            if (isRight) {
              ok++;
            } else {
              wrong++;
              if (!firstWrong) {
                firstWrong = `y=${Math.round(y - bodyRect.top)} expected id ${
                  data[rowAt(y)]?.id
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
              cellText(hit.cell) === String(data[rowIndex][column.field])
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
