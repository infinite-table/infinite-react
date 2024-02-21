import { test, expect } from '@playwright/test';
import { MappedVirtualRows } from '@src/components/HeadlessTable/MappedVirtualRows';

export default test.describe.parallel('MappedVirtualRows', () => {
  test.beforeEach(() => {
    globalThis.__DEV__ = true;
  });
  test('renderRowAtElement should work fine', async ({}) => {
    const rows = new MappedVirtualRows();

    rows.renderRowAtElement(0, 0, 0);
    expect(rows.getRenderedRowAtElement(0)).toBe(0);
    expect(rows.getRenderedNodeForRow(0)).toBe(0);
    rows.renderRowAtElement(1, 1, 1);
    rows.renderRowAtElement(0, 2, 2);

    expect(rows.isRowRendered(0)).toBe(true);
    expect(rows.isRowRendered(1)).toBe(true);
    expect(rows.isRowRendered(2)).toBe(false);

    expect(rows.getRenderedRowAtElement(2)).toBe(0);
    expect(rows.getRenderedRowAtElement(1)).toBe(1);
    expect(rows.getRenderedRowAtElement(2)).toBe(0);

    expect(rows.getRenderedNodeForRow(0)).toBe(2);
  });

  test('renderRowAtElement should work fine - test 2', async ({}) => {
    const rows = new MappedVirtualRows();

    rows.renderRowAtElement(0, 0, 'one');
    rows.renderRowAtElement(1, 1, 'two');
    rows.renderRowAtElement(2, 2, 'two');

    rows.renderRowAtElement(3, 0, 'three');

    expect(rows.isRowRendered(0)).toBe(false);
    expect(rows.getElementIndexForRow(3)).toBe(0);
    expect(rows.getElementIndexForRow(0)).toBe(null);
  });

  test('discardElement should work fine', async () => {
    const rows = new MappedVirtualRows();

    rows.renderRowAtElement(0, 0, 0);
    rows.renderRowAtElement(1, 1, 1);
    rows.renderRowAtElement(2, 2, 2);
    rows.renderRowAtElement(3, 3, 3);

    rows.discardElement(1);
    expect(rows.isRowRendered(1)).toBe(false);
    expect(rows.isRowRendered(0)).toBe(true);
    expect(rows.isRowRendered(2)).toBe(true);
    expect(rows.isRowRendered(3)).toBe(true);
  });

  test('discardRow should work fine', async () => {
    const rows = new MappedVirtualRows();

    rows.renderRowAtElement(0, 0);
    rows.renderRowAtElement(1, 1);
    rows.renderRowAtElement(2, 2);
    rows.renderRowAtElement(3, 3);

    rows.discardRow(2);
    expect(rows.isRowRendered(1)).toBe(true);
    expect(rows.isRowRendered(2)).toBe(false);
    expect(rows.isRowRendered(3)).toBe(true);
  });
  test('discardElementsStartingWith should work fine', async ({}) => {
    const rows = new MappedVirtualRows();

    rows.renderRowAtElement(0, 0);
    rows.renderRowAtElement(1, 1);
    rows.renderRowAtElement(2, 2);
    rows.renderRowAtElement(3, 3);
    rows.renderRowAtElement(4, 4);
    rows.renderRowAtElement(5, 5);

    rows.discardElementsStartingWith(3);

    expect(rows.isRowRendered(0)).toBe(true);
    expect(rows.isRowRendered(1)).toBe(true);
    expect(rows.isRowRendered(2)).toBe(true);
    expect(rows.isRowRendered(3)).toBe(false);
    expect(rows.isRowRendered(4)).toBe(false);
    expect(rows.isRowRendered(5)).toBe(false);
  });

  test('getElementsOutsideRenderRange should work fine', async ({}) => {
    const rows = new MappedVirtualRows();

    rows.renderRowAtElement(0, 0);
    rows.renderRowAtElement(1, 1);
    rows.renderRowAtElement(2, 2);
    rows.renderRowAtElement(3, 3);
    rows.renderRowAtElement(4, 4);
    rows.renderRowAtElement(5, 5);
    rows.renderRowAtElement(6, 6);
    rows.renderRowAtElement(7, 7);
    rows.renderRowAtElement(8, 8);
    rows.renderRowAtElement(9, 9);
    rows.renderRowAtElement(10, 10);

    const elements = rows.getElementsOutsideRenderRange({
      start: [1, 1],
      end: [6, 2],
    });

    expect(elements).toEqual([0, 6, 7, 8, 9, 10]);
  });
});
