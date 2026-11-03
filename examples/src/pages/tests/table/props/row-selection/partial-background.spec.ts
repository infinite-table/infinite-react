import { test, expect } from '@testing';
import type { Page } from '@testing';

/**
 * Grouped rows: JavaScript (ids 1 and 2, both "frontend") is filtered out.
 * Visible: frontend / Bill (3), backend / Mark (4) and Matthew (5).
 *
 * Tree: docs (a, b) and solo (z).
 *
 * A partly selected group or tree parent gets `InfiniteColumnCell--row-partially-selected`
 * (see useCellClassName). A fully selected row gets `InfiniteColumnCell--row-selected`.
 */

const PARTIAL_CLASS = 'InfiniteColumnCell--row-partially-selected';
const SELECTED_CLASS = 'InfiniteColumnCell--row-selected';

const rowCells = (page: Page, rowId: string) =>
  page.locator(
    `.InfiniteColumnCell[data-row-id="${rowId}"]:not(.InfiniteDetachedCell)`,
  );

const expectPartial = async (page: Page, rowId: string) => {
  const cells = rowCells(page, rowId);
  await expect(cells.first()).toBeVisible();
  const count = await cells.count();
  for (let index = 0; index < count; index++) {
    const cell = cells.nth(index);
    await expect(cell).toHaveClass(new RegExp(PARTIAL_CLASS));
    await expect(cell).not.toHaveClass(new RegExp(SELECTED_CLASS));
  }
};

const expectFullySelected = async (page: Page, rowId: string) => {
  const cells = rowCells(page, rowId);
  await expect(cells.first()).toBeVisible();
  const count = await cells.count();
  for (let index = 0; index < count; index++) {
    const cell = cells.nth(index);
    await expect(cell).toHaveClass(new RegExp(SELECTED_CLASS));
    await expect(cell).not.toHaveClass(new RegExp(PARTIAL_CLASS));
  }
};

const expectUnselected = async (page: Page, rowId: string) => {
  const cells = rowCells(page, rowId);
  await expect(cells.first()).toBeVisible();
  const count = await cells.count();
  for (let index = 0; index < count; index++) {
    const cell = cells.nth(index);
    await expect(cell).not.toHaveClass(new RegExp(PARTIAL_CLASS));
    await expect(cell).not.toHaveClass(new RegExp(SELECTED_CLASS));
  }
};

const checkbox = (page: Page, rowId: string, columnId = 'checkbox') =>
  page.locator(
    `.InfiniteColumnCell[data-column-id="${columnId}"][data-row-id="${rowId}"]:not(.InfiniteDetachedCell) input[type="checkbox"]`,
  );

const selectedIds = (page: Page) =>
  page.evaluate(() =>
    [
      ...(
        globalThis as any
      ).INFINITE_GRID_API.rowSelectionApi.getSelectedPrimaryKeys(),
    ].sort((a: number, b: number) => a - b),
  );

export default test.describe
  .parallel('Partial row selection background', () => {
  test.beforeEach(async ({ page }) => {
    await page.waitForInfinite();
  });

  test('a group with filtered-out rows is marked partly selected', async ({
    page,
  }) => {
    await checkbox(page, '3').click();

    await expect.poll(() => selectedIds(page)).toEqual([3]);
    await expectPartial(page, 'frontend');
    await expectFullySelected(page, '3');
    await expectUnselected(page, 'backend');
    await expect
      .poll(() =>
        checkbox(page, 'frontend').evaluate(
          (input: HTMLInputElement) => input.indeterminate,
        ),
      )
      .toBe(true);
  });

  test('selecting every row of a group, including filtered-out rows, marks it fully selected', async ({
    page,
  }) => {
    await checkbox(page, '4').click();
    await expectPartial(page, 'backend');

    await checkbox(page, '5').click();
    await expectFullySelected(page, 'backend');
    await expectFullySelected(page, '4');
    await expectFullySelected(page, '5');
    await expect(checkbox(page, 'backend')).toBeChecked();
    await expect
      .poll(() =>
        checkbox(page, 'backend').evaluate(
          (input: HTMLInputElement) => input.indeterminate,
        ),
      )
      .toBe(false);

    await checkbox(page, 'frontend').click();
    await expect.poll(() => selectedIds(page)).toEqual([1, 2, 3, 4, 5]);
    await expectFullySelected(page, 'frontend');
    await expect(checkbox(page, 'frontend')).toBeChecked();
  });

  test('a partly selected tree parent gets the same class', async ({
    page,
  }) => {
    await page.evaluate(() => (globalThis as any).setKind('tree'));
    await expect(checkbox(page, 'a', 'name')).toBeVisible();

    await checkbox(page, 'a', 'name').click();
    await expectPartial(page, 'docs');
    await expectFullySelected(page, 'a');
    await expectUnselected(page, 'solo');
    await expectUnselected(page, 'b');
    await expect
      .poll(() =>
        checkbox(page, 'docs', 'name').evaluate(
          (input: HTMLInputElement) => input.indeterminate,
        ),
      )
      .toBe(true);

    await checkbox(page, 'b', 'name').click();
    await expectFullySelected(page, 'docs');
    await expect(checkbox(page, 'docs', 'name')).toBeChecked();

    await checkbox(page, 'z', 'name').click();
    await expectFullySelected(page, 'solo');
    await expectFullySelected(page, 'z');
  });
});
