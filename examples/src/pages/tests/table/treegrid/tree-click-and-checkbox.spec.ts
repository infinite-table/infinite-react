import { test, expect } from '@testing';
import { Page } from '@playwright/test';

/**
 * The nodes as displayed - pics is collapsed:
 *
 * 0 docs
 * 1   a
 * 2   b
 * 3 pics (collapsed - x, y)
 * 4 music
 * 5   s1
 * 6   s2
 * 7   sub
 * 8     t1
 *
 * The selected ids are the selected leaf nodes (or the selected node, for single-row selection).
 */

async function press(page: Page, name: string) {
  await page.click(`[data-name="${name}"]`);
}

async function selectedIds(page: Page) {
  return JSON.parse(
    (await page.locator('[data-name="selected-ids"]').textContent()) || '[]',
  );
}

function cell(page: Page, rowIndex: number, colId = 'type') {
  return page.locator(
    `.InfiniteColumnCell[data-row-index="${rowIndex}"][data-column-id="${colId}"]:not(.InfiniteDetachedCell)`,
  );
}

async function clickRow(
  page: Page,
  rowIndex: number,
  modifiers?: ('Shift' | 'ControlOrMeta')[],
) {
  await cell(page, rowIndex).click({ modifiers });
}

async function clickCheckbox(
  page: Page,
  rowIndex: number,
  modifiers?: ('Shift' | 'ControlOrMeta')[],
) {
  await cell(page, rowIndex, 'name')
    .locator('input[type="checkbox"]')
    .click({ modifiers });
}

export default test.describe.parallel('Tree - click and checkbox selection', () => {
  test('without a checkbox: click, cmd+click, shift+click and space select nodes', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await clickRow(page, 1);
    expect(await selectedIds(page)).toEqual(['a']);

    // the collapsed pics is selected as a whole, the expanded music follows its children
    await clickRow(page, 5, ['Shift']);
    expect(await selectedIds(page)).toEqual(['a', 'b', 's1', 'x', 'y']);

    // going down to the expanded music node selects none of its children
    await clickRow(page, 4, ['Shift']);
    expect(await selectedIds(page)).toEqual(['a', 'b', 'x', 'y']);

    await clickRow(page, 8, ['Shift']);
    expect(await selectedIds(page)).toEqual([
      'a',
      'b',
      's1',
      's2',
      't1',
      'x',
      'y',
    ]);

    // cmd/ctrl+click toggles a parent node as a whole
    await clickRow(page, 3, ['ControlOrMeta']);
    expect(await selectedIds(page)).toEqual(['a', 'b', 's1', 's2', 't1']);

    // a click on a parent node selects all its nodes, and only those
    await clickRow(page, 0);
    expect(await selectedIds(page)).toEqual(['a', 'b']);

    // space works like a click, sharing the anchor with clicks
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press(' ');
    expect(await selectedIds(page)).toEqual(['b']);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Shift+ ');
    expect(await selectedIds(page)).toEqual(['b', 'x', 'y']);

    // expanding/collapsing a node doesn't change the selection
    await cell(page, 0, 'name')
      .locator('[data-name="expand-collapse-icon"]')
      .click();
    await expect(cell(page, 1, 'name')).toContainText('pics');
    expect(await selectedIds(page)).toEqual(['b', 'x', 'y']);
  });

  test('with a checkbox: the checkbox and space select, clicks do not', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await press(page, 'checkbox-on');
    await expect(
      cell(page, 1, 'name').locator('input[type="checkbox"]'),
    ).toBeVisible();

    await clickRow(page, 1);
    expect(await selectedIds(page)).toEqual([]);

    await clickCheckbox(page, 1);
    expect(await selectedIds(page)).toEqual(['a']);

    // shift + a checkbox selects the range from the last checkbox
    await clickCheckbox(page, 5, ['Shift']);
    expect(await selectedIds(page)).toEqual(['a', 'b', 's1', 'x', 'y']);

    // a checkbox toggles, keeping the rest of the selection
    await clickCheckbox(page, 3);
    expect(await selectedIds(page)).toEqual(['a', 'b', 's1']);

    // a partly selected parent node is selected as a whole
    await clickCheckbox(page, 4);
    expect(await selectedIds(page)).toEqual(['a', 'b', 's1', 's2', 't1']);

    // space toggles the active row, like its checkbox
    await clickRow(page, 6);
    await page.keyboard.press(' ');
    expect(await selectedIds(page)).toEqual(['a', 'b', 's1', 't1']);

    // with multiRowSelectionWith="click", clicks select again
    await press(page, 'select-with-click');
    await clickRow(page, 2);
    expect(await selectedIds(page)).toEqual(['b']);
    await clickRow(page, 5, ['Shift']);
    expect(await selectedIds(page)).toEqual(['b', 's1', 'x', 'y']);
  });

  test('single-row: clicks and space select one node', async ({ page }) => {
    await page.waitForInfinite();
    await press(page, 'single-row');
    await expect(page.locator('[data-name="selection-config"]')).toContainText(
      '"singleRow":true',
    );

    await clickRow(page, 1);
    expect(await selectedIds(page)).toEqual(['a']);

    // parent nodes are rows of the tree, so they can be selected too
    await clickRow(page, 4);
    expect(await selectedIds(page)).toEqual(['music']);

    await clickRow(page, 4, ['ControlOrMeta']);
    expect(await selectedIds(page)).toEqual([]);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press(' ');
    expect(await selectedIds(page)).toEqual(['s1']);

    await page.keyboard.press(' ');
    expect(await selectedIds(page)).toEqual([]);
  });
});
