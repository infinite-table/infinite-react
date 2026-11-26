import { test, expect } from '@testing';

import {
  getLayoutErrors,
  getScrollMax,
  getScrollPosition,
  getScrollPositions,
  scrollGridTo,
} from './pinnedRowsAndColsChecks';

const POLL = { timeout: 3000 };

export default test.describe('HeadlessTable on its own, with rows and columns pinned at both ends', () => {
  test.beforeEach(async ({ page }) => {
    // many scroll positions, each one waiting for the layout to settle
    test.setTimeout(60_000);
    await page.load();
    await page.locator('#host[data-ready="true"]').waitFor();
  });

  test('every cell is in place and the right one is on top, at every scroll position', async ({
    page,
  }) => {
    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);

    const max = await getScrollMax(page);
    expect(max.scrollLeftMax).toBeGreaterThan(1000);
    expect(max.scrollTopMax).toBeGreaterThan(5000);

    for (const position of getScrollPositions(max)) {
      await scrollGridTo(page, position);
      await expect.poll(() => getScrollPosition(page), POLL).toEqual(position);

      const label = `scrollLeft ${position.scrollLeft} scrollTop ${position.scrollTop}`;
      await expect
        .poll(async () => [label, ...(await getLayoutErrors(page))], POLL)
        .toEqual([label]);
    }
  });

  test('pinned cells do not move, and rows and columns stay aligned, while scrolling with the wheel', async ({
    page,
  }) => {
    // the page starts the table at the host's outer size; the table measures
    // its real (inner) size a little later, and the pinned end rows and
    // columns move once then - they're compared against the first recorded
    // frame, so recording must start after that
    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);

    await page.evaluate(() => {
      const frames: {
        scroll: [number, number];
        lefts: Record<string, number[]>;
        tops: Record<string, number[]>;
      }[] = [];
      const target = document.querySelector<HTMLElement>(
        '#host [data-name="scroll-transform-target"]',
      )!;
      const scroller = target.parentElement!;
      // Measured in a ResizeObserver callback: those run after all the
      // requestAnimationFrame callbacks of a frame (the table moves its scroll
      // layer in one) and after layout, right before paint - so this is what
      // gets painted.
      const probe = document.createElement('div');
      probe.style.cssText =
        'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none';
      document.body.appendChild(probe);
      let stopped = false;
      let toggle = false;
      const tick = () => {
        if (stopped) {
          return;
        }
        // a size change every frame, so the observer runs every frame
        toggle = !toggle;
        probe.style.width = toggle ? '2px' : '1px';
        requestAnimationFrame(tick);
      };
      const record = () => {
        if (stopped) {
          return;
        }
        const box = scroller.getBoundingClientRect();
        const lefts: Record<string, number[]> = {};
        const tops: Record<string, number[]> = {};
        target
          .querySelectorAll<HTMLElement>(
            '[data-cell]:not(.InfiniteDetachedCell)',
          )
          .forEach((cell) => {
            // the slot the renderer put the element in: its content (data-cell)
            // can lag behind while React has not re-rendered it yet
            const r = cell.dataset.rowIndex!;
            const c = cell.dataset.colIndex!;
            const rect = cell.getBoundingClientRect();
            (lefts[c] = lefts[c] || []).push(rect.left - box.left);
            (tops[r] = tops[r] || []).push(rect.top - box.top);
          });
        frames.push({
          scroll: [scroller.scrollLeft, scroller.scrollTop],
          lefts,
          tops,
        });
      };
      new ResizeObserver(record).observe(probe);
      requestAnimationFrame(tick);
      (globalThis as any).stopRecording = () => {
        stopped = true;
        return frames;
      };
    });

    const box = (await page.locator('#host').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(90, 0);
      await page.waitForTimeout(16);
    }
    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(16);
    }
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(-70, 70);
      await page.waitForTimeout(16);
    }
    await page.waitForTimeout(400);

    const frames: {
      scroll: [number, number];
      lefts: Record<string, number[]>;
      tops: Record<string, number[]>;
    }[] = await page.evaluate(() => (globalThis as any).stopRecording());

    expect(frames.length).toBeGreaterThan(20);
    // the gestures did scroll, both ways
    expect(Math.max(...frames.map((f) => f.scroll[0]))).toBeGreaterThan(300);
    expect(Math.max(...frames.map((f) => f.scroll[1]))).toBeGreaterThan(300);

    const PINNED_COLS = ['0', '1', '38', '39'];
    const PINNED_ROWS = ['0', '1', '398', '399'];

    const problems: string[] = [];
    const first: Record<string, number> = {};
    const spread = (values: number[]) =>
      Math.max(...values) - Math.min(...values);

    frames.forEach((frame, index) => {
      const at = `frame ${index} (scroll ${frame.scroll.join(',')})`;
      Object.entries(frame.lefts).forEach(([col, lefts]) => {
        if (spread(lefts) > 0.5) {
          problems.push(`${at}: the cells of column ${col} are not aligned`);
        }
        if (PINNED_COLS.includes(col)) {
          const key = `column ${col}`;
          first[key] = first[key] ?? lefts[0];
          if (Math.abs(first[key] - lefts[0]) > 0.5) {
            problems.push(`${at}: pinned ${key} moved to x ${lefts[0]}`);
          }
        }
      });
      Object.entries(frame.tops).forEach(([row, tops]) => {
        if (spread(tops) > 0.5) {
          problems.push(`${at}: the cells of row ${row} are not aligned`);
        }
        if (PINNED_ROWS.includes(row)) {
          const key = `row ${row}`;
          first[key] = first[key] ?? tops[0];
          if (Math.abs(first[key] - tops[0]) > 0.5) {
            problems.push(`${at}: pinned ${key} moved to y ${tops[0]}`);
          }
        }
      });
    });

    expect(problems.slice(0, 10)).toEqual([]);
    // all the pinned rows and columns were seen
    expect(Object.keys(first).sort()).toEqual(
      [
        ...PINNED_COLS.map((c) => `column ${c}`),
        ...PINNED_ROWS.map((r) => `row ${r}`),
      ].sort(),
    );
  });

  test('the wheel over the pinned rows, the pinned columns and the corners scrolls the table', async ({
    page,
  }) => {
    const box = (await page.locator('#host').boundingBox())!;
    const points = [
      // pinned start rows, pinned end rows
      [box.width / 2, 10],
      [box.width / 2, box.height - 15],
      // pinned start cols, pinned end cols
      [10, box.height / 2],
      [box.width - 25, box.height / 2],
      // the corners
      [10, 10],
      [box.width - 25, box.height - 15],
    ];

    for (const [x, y] of points) {
      await scrollGridTo(page, { scrollLeft: 0, scrollTop: 0 });
      await expect
        .poll(() => getScrollPosition(page), POLL)
        .toEqual({ scrollLeft: 0, scrollTop: 0 });

      await page.mouse.move(box.x + x, box.y + y);
      await page.mouse.wheel(100, 200);

      await expect
        .poll(async () => {
          const { scrollLeft, scrollTop } = await getScrollPosition(page);
          return `at ${Math.round(x)},${Math.round(y)}: ${
            scrollLeft > 0 && scrollTop > 0 ? 'scrolled' : 'did not scroll'
          }`;
        }, POLL)
        .toBe(`at ${Math.round(x)},${Math.round(y)}: scrolled`);
    }
    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);
  });

  test('the pinned end rows and columns follow the edges when the table is resized', async ({
    page,
  }) => {
    await scrollGridTo(page, { scrollLeft: 300, scrollTop: 900 });

    for (const [width, height] of [
      [600, 300],
      [1100, 520],
      [800, 400],
    ]) {
      await page.evaluate(
        ([width, height]) => (globalThis as any).setGridSize(width, height),
        [width, height],
      );
      const label = `${width}x${height}`;
      await expect
        .poll(async () => [label, ...(await getLayoutErrors(page))], POLL)
        .toEqual([label]);
    }
  });
});
