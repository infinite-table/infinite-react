import { test, expect } from '@playwright/test';
import { OnScrollFn } from '@src/components/types/ScrollPosition';
import { HorizontalLayoutMatrixBrain } from '@src/components/VirtualBrain/HorizontalLayoutMatrixBrain';
import { FnOnRenderRangeChange } from '@src/components/VirtualBrain/MatrixBrain';

const sinon = require('sinon');

type ExtraProps = { callCount: number; firstArg: any };

export default test.describe.parallel('HorizontalLayoutMatrixBrain', () => {
  test.beforeEach(({ page }) => {
    globalThis.__DEV__ = true;
    page.on('console', async (msg) => {
      const values = [];
      for (const arg of msg.args()) values.push(await arg.jsonValue());
      console.log(...values);
    });
  });

  test('getMatrixCoordinatesForHorizontalLayoutPosition', async () => {
    const COL_SIZE = 100;
    const ROW_SIZE = 50;
    const WIDTH = 220;
    const HEIGHT = 160;
    const ROWS = 50;
    const COLS = 2;

    const brain = new HorizontalLayoutMatrixBrain('test', { isHeader: false });

    brain.update({
      colWidth: COL_SIZE,
      rowHeight: ROW_SIZE,
      width: WIDTH,
      height: HEIGHT,
      cols: COLS,
      rows: ROWS,
    });

    expect(brain.rowsPerPage).toBe(3);

    // rows per page = 3
    expect(
      brain.getMatrixCoordinatesForHorizontalLayoutPosition({
        rowIndex: 0,
        colIndex: 0,
      }),
    ).toEqual({
      rowIndex: 0,
      colIndex: 0,
    });

    expect(
      brain.getMatrixCoordinatesForHorizontalLayoutPosition({
        rowIndex: 5,
        colIndex: 0,
      }),
    ).toEqual({
      rowIndex: 2,
      colIndex: 2,
    });

    expect(
      brain.getMatrixCoordinatesForHorizontalLayoutPosition({
        rowIndex: 10,
        colIndex: 1,
      }),
    ).toEqual({
      rowIndex: 1,
      colIndex: 7,
    });
  });

  test('getHorizontalLayoutPositionFromMatrixCoordinates', async () => {
    const COL_SIZE = 100;
    const ROW_SIZE = 50;
    const WIDTH = 220;
    const HEIGHT = 160;
    const ROWS = 50;
    const COLS = 2;

    const brain = new HorizontalLayoutMatrixBrain('test', { isHeader: false });

    brain.update({
      colWidth: COL_SIZE,
      rowHeight: ROW_SIZE,
      width: WIDTH,
      height: HEIGHT,
      cols: COLS,
      rows: ROWS,
    });

    expect(brain.rowsPerPage).toBe(3);

    // rows per page = 3
    expect(
      brain.getHorizontalLayoutPositionFromMatrixCoordinates({
        rowIndex: 1,
        colIndex: 3,
      }),
    ).toEqual({
      rowIndex: 4,
      colIndex: 1,
    });

    expect(
      brain.getHorizontalLayoutPositionFromMatrixCoordinates({
        rowIndex: 0,
        colIndex: 6,
      }),
    ).toEqual({
      rowIndex: 9,
      colIndex: 0,
    });
  });
  test('should correctly give me the render range', async () => {
    const COL_SIZE = 100;
    const ROW_SIZE = 50;
    const WIDTH = 230;
    const HEIGHT = 420;
    const ROWS = 50;
    const COLS = 2;

    const brain = new HorizontalLayoutMatrixBrain('test', { isHeader: false });

    brain.update({
      colWidth: COL_SIZE,
      rowHeight: ROW_SIZE,
      width: WIDTH,
      height: HEIGHT,
      cols: COLS,
      rows: ROWS,
    });

    const initialRange = {
      start: [0, 0],
      end: [8, 5],
    };
    expect(brain.getRenderRange()).toEqual(initialRange);

    // scroll just a bit, to not trigger a render range change
    brain.setScrollPosition({
      scrollLeft: 20,
      scrollTop: 0,
    });

    expect(brain.getRenderRange()).toEqual(initialRange);

    return;
    // scroll horizontally more, to trigger a render range change on horizontal only
    brain.setScrollPosition({
      scrollLeft: 120,
      scrollTop: 0,
    });

    expect(brain.getRenderRange()).toEqual({
      start: [0, 1],
      end: [
        Math.ceil(HEIGHT / ROW_SIZE) + 1,
        Math.min(Math.ceil(WIDTH / COL_SIZE) + 2, COLS),
      ],
    });

    // scroll horizontally even more, to trigger a render range change on horizontal only
    brain.setScrollPosition({
      scrollLeft: 520,
      scrollTop: 0,
    });

    expect(brain.getRenderRange()).toEqual({
      start: [0, 3],
      end: [Math.ceil(HEIGHT / ROW_SIZE) + 1, 7],
    });
  });

  test('should correctly return the render range when scrolling horizontally', async () => {
    const COL_SIZE = 100;
    const ROW_SIZE = 50;
    const WIDTH = 230;
    const HEIGHT = 420;
    const ROWS = 20;
    const COLS = 7;

    const brain = new HorizontalLayoutMatrixBrain('test', { isHeader: false });

    brain.update({
      colWidth: COL_SIZE,
      rowHeight: ROW_SIZE,
      width: WIDTH,
      height: HEIGHT,
      cols: COLS,
      rows: ROWS,
    });

    brain.setScrollPosition({
      scrollLeft: 220,
      scrollTop: 0,
    });

    expect(brain.getRenderRange()).toEqual({
      start: [0, 1],
      end: [8, 6],
    });
  });

  test('should correctly have initial render range', async () => {
    const COL_SIZE = 100;
    const ROW_SIZE = 50;
    const WIDTH = 710;
    const HEIGHT = 392;
    const ROWS = 30;
    const COLS = 2;

    const brain = new HorizontalLayoutMatrixBrain('test', { isHeader: false });

    brain.update({
      colWidth: COL_SIZE,
      rowHeight: ROW_SIZE,
      width: WIDTH,
      height: HEIGHT,
      cols: COLS,
      rows: ROWS,
    });

    expect(brain.getRenderRange()).toEqual({
      start: [0, 0],
      end: [7, 10],
    });
  });

  test.skip('THIS WAS COPIED FROM MATRIX BRAIN AND NOT ADJUSTED - should correctly trigger onRenderRange change when scrolling and changing available size', async ({
    page,
  }) => {
    const COL_SIZE = 100;
    const ROW_SIZE = 50;
    const WIDTH = 230;
    const HEIGHT = 420;
    const ROWS = 20;
    const COLS = 7;

    const brain = new HorizontalLayoutMatrixBrain('test', { isHeader: false });

    brain.update({
      colWidth: COL_SIZE,
      rowHeight: ROW_SIZE,
      width: WIDTH,
      height: HEIGHT,
      cols: COLS,
      rows: ROWS,
    });

    const onRenderRangeChange = sinon.fake() as FnOnRenderRangeChange &
      ExtraProps;
    const onScroll = sinon.fake() as OnScrollFn & ExtraProps;

    brain.onRenderRangeChange(onRenderRangeChange);
    brain.onScroll(onScroll);

    brain.update({
      width: WIDTH + 100,
      height: HEIGHT + 100,
    });

    await page.waitForTimeout(5);

    expect(onRenderRangeChange.callCount).toBe(1);
    expect(onRenderRangeChange.firstArg).toEqual({
      start: [0, 0],
      end: [12, 5],
    });

    // scroll down and right a bit, but not too much so the render range stays the same
    brain.setScrollPosition({
      scrollTop: 10,
      scrollLeft: 30,
    });

    await page.waitForTimeout(5);

    expect(onRenderRangeChange.callCount).toBe(1);
    expect(onScroll.callCount).toBe(1);

    brain.setScrollPosition({
      scrollTop: 60,
      scrollLeft: 120,
    });

    await page.waitForTimeout(5);

    expect(onRenderRangeChange.callCount).toBe(2);
    expect(onRenderRangeChange.firstArg).toEqual({
      start: [1, 1],
      end: [13, 6],
    });

    // now set a new size

    brain.update({
      height: HEIGHT + 200,
      width: WIDTH + 200,
    });

    await page.waitForTimeout(5);

    // and expect render range to have changed
    expect(onRenderRangeChange.callCount).toBe(3);
    expect(onRenderRangeChange.firstArg).toEqual({
      start: [1, 1],
      end: [15, 7],
    });
  });

  test.skip('THIS WAS COPIED FROM MATRIX BRAIN AND NOT ADJUSTED - should correctly trigger onRenderRangeChange when count gets smaller than the max render range', async ({
    page,
  }) => {
    const COL_SIZE = 100;
    const ROW_SIZE = 50;
    const WIDTH = 230;
    const HEIGHT = 420;
    const ROWS = 20;
    const COLS = 7;

    const brain = new HorizontalLayoutMatrixBrain('test', { isHeader: false });

    brain.update({
      colWidth: COL_SIZE,
      rowHeight: ROW_SIZE,
      width: WIDTH,
      height: HEIGHT,
      cols: COLS,
      rows: ROWS,
    });

    const onRenderRangeChange = sinon.fake() as FnOnRenderRangeChange &
      ExtraProps;
    const onScroll = sinon.fake() as OnScrollFn & ExtraProps;

    brain.onRenderRangeChange(onRenderRangeChange);
    brain.onScroll(onScroll);

    await page.waitForTimeout(5);

    expect(brain.getRenderRange()).toEqual({
      start: [0, 0],
      end: [10, 4],
    });

    brain.update({
      rows: 5,
    });
    await page.waitForTimeout(5);

    expect(onRenderRangeChange.callCount).toEqual(1);
    expect(onRenderRangeChange.firstArg).toEqual({
      start: [0, 0],
      end: [5, 4],
    });
  });
});
