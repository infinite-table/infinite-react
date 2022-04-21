import { test, expect } from '@playwright/test';
import { MappedCells } from '@src/components/HeadlessTable/MappedCells';

export default test.describe.parallel('MappedCells', () => {
  test.beforeEach(() => {
    globalThis.__DEV__ = true;
  });
  test('renderCellAtElement should work fine', async ({}) => {
    const cells = new MappedCells();

    cells.renderCellAtElement(0, 0, 0);
    cells.renderCellAtElement(0, 1, 1);
    cells.renderCellAtElement(0, 2, 2);

    expect(cells.isCellRendered(0, 2)).toBe(true);
    expect(cells.isCellRendered(1, 1)).toBe(false);

    cells.renderCellAtElement(0, 3, 2);
    expect(cells.isCellRendered(0, 2)).toBe(false);
  });

  test('discardElement should work fine', async () => {
    const cells = new MappedCells();

    cells.renderCellAtElement(0, 0, 0);
    cells.renderCellAtElement(1, 1, 1);
    cells.renderCellAtElement(2, 2, 2);
    cells.renderCellAtElement(3, 3, 3);

    cells.discardElement(1);
    expect(cells.isCellRendered(1, 1)).toBe(false);
  });

  test('discardCell should work fine', async () => {
    const cells = new MappedCells();

    cells.renderCellAtElement(0, 0, 0);
    cells.renderCellAtElement(1, 1, 1);
    cells.renderCellAtElement(2, 2, 2);
    cells.renderCellAtElement(3, 3, 3);

    cells.discardCell(1, 2);
    expect(cells.isCellRendered(1, 1)).toBe(true);
    cells.discardCell(1, 1);
    expect(cells.isCellRendered(1, 1)).toBe(false);

    expect(cells.isCellRendered(3, 3)).toBe(true);
    cells.renderCellAtElement(4, 3, 3);
    expect(cells.isCellRendered(3, 3)).toBe(false);
  });
  test('discardElementsStartingWith should work fine', async ({}) => {
    const cells = new MappedCells();

    cells.renderCellAtElement(0, 0, 0);
    cells.renderCellAtElement(0, 1, 1);
    cells.renderCellAtElement(0, 2, 2);
    cells.renderCellAtElement(1, 0, 3);
    cells.renderCellAtElement(1, 1, 4);
    cells.renderCellAtElement(1, 2, 5);

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

    cells.renderCellAtElement(0, 0, 0);
    cells.renderCellAtElement(0, 1, 1);
    cells.renderCellAtElement(0, 2, 2);
    cells.renderCellAtElement(1, 0, 3);
    cells.renderCellAtElement(1, 1, 4);
    cells.renderCellAtElement(1, 2, 5);
    cells.renderCellAtElement(4, 0, 6);
    cells.renderCellAtElement(5, 1, 7);
    cells.renderCellAtElement(5, 2, 8);
    cells.renderCellAtElement(6, 1, 9);
    cells.renderCellAtElement(6, 2, 10);

    const elements = cells.getElementsOutsideRenderRange({
      start: [1, 1],
      end: [6, 2],
    });

    expect(elements).toEqual([0, 1, 2, 3, 5, 6, 8, 9, 10]);
  });
});
