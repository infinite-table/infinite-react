import { test, expect } from '@playwright/test';
import { MappedCells } from '@src/components/HeadlessTable/MappedCells';

export default test.describe.parallel('MappedCells', () => {
  test.beforeEach(() => {
    globalThis.__DEV__ = true;
  });
  test('renderCellAtElement should work fine', async ({}) => {
    const cells = new MappedCells();

    cells.renderCellAtElement(0, 0, 0, undefined);
    cells.renderCellAtElement(0, 1, 1, undefined);
    cells.renderCellAtElement(0, 2, 2, undefined);

    expect(cells.isCellRendered(0, 2)).toBe(true);
    expect(cells.isCellRendered(1, 1)).toBe(false);

    cells.renderCellAtElement(0, 3, 2, undefined);
    expect(cells.isCellRendered(0, 2)).toBe(false);
  });

  test('discardElement should work fine', async () => {
    const cells = new MappedCells();

    cells.renderCellAtElement(0, 0, 0, undefined);
    cells.renderCellAtElement(1, 1, 1, undefined);
    cells.renderCellAtElement(2, 2, 2, undefined);
    cells.renderCellAtElement(3, 3, 3, undefined);

    cells.discardElement(1);
    expect(cells.isCellRendered(1, 1)).toBe(false);
  });

  test('discardCell should work fine', async () => {
    const cells = new MappedCells();

    cells.renderCellAtElement(0, 0, 0, undefined);
    cells.renderCellAtElement(1, 1, 1, undefined);
    cells.renderCellAtElement(2, 2, 2, undefined);
    cells.renderCellAtElement(3, 3, 3, undefined);

    cells.discardCell(1, 2);
    expect(cells.isCellRendered(1, 1)).toBe(true);
    cells.discardCell(1, 1);
    expect(cells.isCellRendered(1, 1)).toBe(false);

    expect(cells.isCellRendered(3, 3)).toBe(true);
    cells.renderCellAtElement(4, 3, 3, undefined);
    expect(cells.isCellRendered(3, 3)).toBe(false);
  });
  test('discardElementsStartingWith should work fine', async ({}) => {
    const cells = new MappedCells();

    cells.renderCellAtElement(0, 0, 0, undefined);
    cells.renderCellAtElement(0, 1, 1, undefined);
    cells.renderCellAtElement(0, 2, 2, undefined);
    cells.renderCellAtElement(1, 0, 3, undefined);
    cells.renderCellAtElement(1, 1, 4, undefined);
    cells.renderCellAtElement(1, 2, 5, undefined);

    cells.discardElementsStartingWith(3);

    expect(cells.isCellRendered(0, 0)).toBe(true);
    expect(cells.isCellRendered(0, 1)).toBe(true);
    expect(cells.isCellRendered(0, 2)).toBe(true);
    expect(cells.isCellRendered(1, 0)).toBe(false);
    expect(cells.isCellRendered(1, 1)).toBe(false);
    expect(cells.isCellRendered(1, 2)).toBe(false);

    expect(cells.isCellRendered(2, 9)).toBe(false);
  });

  test('getElementsOutsideRenderRange should work fine', async ({}) => {
    const cells = new MappedCells();

    cells.renderCellAtElement(0, 0, 0, undefined);
    cells.renderCellAtElement(0, 1, 1, undefined);
    cells.renderCellAtElement(0, 2, 2, undefined);
    cells.renderCellAtElement(1, 0, 3, undefined);
    cells.renderCellAtElement(1, 1, 4, undefined);
    cells.renderCellAtElement(1, 2, 5, undefined);
    cells.renderCellAtElement(4, 0, 6, undefined);
    cells.renderCellAtElement(5, 1, 7, undefined);
    cells.renderCellAtElement(5, 2, 8, undefined);
    cells.renderCellAtElement(6, 1, 9, undefined);
    cells.renderCellAtElement(6, 2, 10, undefined);

    const elements = cells.getElementsOutsideRenderRange({
      start: [1, 1],
      end: [6, 2],
    });

    expect(elements).toEqual([0, 1, 2, 3, 5, 6, 8, 9, 10]);
  });
});
