import { test, expect } from '@testing';
import { Page } from '@playwright/test';

/**
 * Flat, the rows are TS 1-3 (ids 1-3), Go 1-2 (ids 4-5), Rust 1-3 (ids 6-8).
 *
 * Grouped by language, with the Go group collapsed (button "collapse-go"):
 *
 * 0 TypeScript
 * 1   TS 1
 * 2   TS 2
 * 3   TS 3
 * 4 Go (collapsed - ids 4, 5)
 * 5 Rust
 * 6   Rust 1
 * 7   Rust 2
 * 8   Rust 3
 *
 * Grouped by language and level (button "group-nested"), with TypeScript / senior
 * and Go collapsed (buttons "collapse-ts-senior" and "collapse-go"):
 *
 * 0  TypeScript
 * 1    junior
 * 2      TS 1
 * 3    senior (collapsed - ids 2, 3)
 * 4  Go (collapsed - ids 4, 5)
 * 5  Rust
 * 6    junior
 * 7      Rust 1
 * 8      Rust 2
 * 9    senior
 * 10     Rust 3
 */

async function press(page: Page, name: string) {
  await page.click(`[data-name="${name}"]`);
}

async function selectedIds(page: Page) {
  return JSON.parse(
    (await page.locator('[data-name="selected-ids"]').textContent()) || '[]',
  );
}

function cell(page: Page, rowIndex: number, colId = 'name') {
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
  colId: string,
  modifiers?: ('Shift' | 'ControlOrMeta')[],
) {
  await cell(page, rowIndex, colId)
    .locator('input[type="checkbox"]')
    .click({ modifiers });
}

async function groupWithGoCollapsed(page: Page) {
  await press(page, 'group');
  await press(page, 'collapse-go');
  await expect(cell(page, 5, 'group-by')).toContainText('Rust');
}

async function groupNestedWithCollapsedGroups(page: Page) {
  await press(page, 'group-nested');
  await expect(cell(page, 1, 'group-by')).toContainText('junior');
  await press(page, 'collapse-ts-senior');
  await press(page, 'collapse-go');
  await expect(cell(page, 5, 'group-by')).toContainText('Rust');
  await expect(cell(page, 10)).toContainText('Rust 3');
}

export default test.describe.parallel('Row selection - click and checkbox', () => {
  test('flat, without a checkbox: click, cmd+click, shift+click and space select', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await clickRow(page, 1);
    expect(await selectedIds(page)).toEqual([2]);

    await clickRow(page, 4, ['Shift']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5]);

    // space works like a click, sharing the anchor with clicks:
    // shift+space on the next row replaces the shift+click range
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Shift+ ');
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5, 6]);

    await clickRow(page, 7, ['ControlOrMeta']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5, 6, 8]);

    await page.keyboard.press(' ');
    expect(await selectedIds(page)).toEqual([8]);
  });

  test('grouped, without a checkbox: clicks select rows and whole groups', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await groupWithGoCollapsed(page);

    // the documented example: click TS 2, then shift+click Rust 2
    await clickRow(page, 2);
    await clickRow(page, 7, ['Shift']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5, 6, 7]);

    // shift+click the Rust group row - its rows are all past the end of the range
    await clickRow(page, 5, ['Shift']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5]);

    // a wider range never selects less
    await clickRow(page, 6, ['Shift']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5, 6]);

    // shift+click back up into the TypeScript group
    await clickRow(page, 1, ['Shift']);
    expect(await selectedIds(page)).toEqual([1, 2]);

    // a click on a group row selects that whole group only
    await clickRow(page, 4);
    expect(await selectedIds(page)).toEqual([4, 5]);

    await clickRow(page, 5, ['ControlOrMeta']);
    expect(await selectedIds(page)).toEqual([4, 5, 6, 7, 8]);

    // expanding/collapsing a group doesn't change the selection
    await cell(page, 0, 'group-by')
      .locator('[data-name="expand-collapse-icon"]')
      .click();
    await expect(cell(page, 1, 'group-by')).toContainText('Go');
    expect(await selectedIds(page)).toEqual([4, 5, 6, 7, 8]);
  });

  test('nested groups, without a checkbox: ranges cross collapsed and expanded groups at every level', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await groupNestedWithCollapsedGroups(page);

    await clickRow(page, 2);
    expect(await selectedIds(page)).toEqual([1]);

    // the collapsed TypeScript / senior and Go are selected as a whole, while the
    // expanded Rust and Rust / junior follow their rows
    await clickRow(page, 7, ['Shift']);
    expect(await selectedIds(page)).toEqual([1, 2, 3, 4, 5, 6]);

    // going down to the expanded Rust / junior selects none of its rows
    await clickRow(page, 6, ['Shift']);
    expect(await selectedIds(page)).toEqual([1, 2, 3, 4, 5]);

    // a wider range never selects less
    await clickRow(page, 10, ['Shift']);
    expect(await selectedIds(page)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);

    // shift+click back up - the TypeScript and TypeScript / junior group rows are
    // above all their rows, so only the starting row is left
    await clickRow(page, 0, ['Shift']);
    expect(await selectedIds(page)).toEqual([1]);

    // a nested group row as the anchor stays selected as a whole
    await clickRow(page, 9);
    expect(await selectedIds(page)).toEqual([8]);
    await clickRow(page, 3, ['Shift']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5, 6, 7, 8]);

    // cmd/ctrl+click toggles a top level group with all its nested groups
    await clickRow(page, 5, ['ControlOrMeta']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5]);

    // a partly selected group is selected as a whole
    await clickRow(page, 0, ['ControlOrMeta']);
    expect(await selectedIds(page)).toEqual([1, 2, 3, 4, 5]);

    // a click on a nested group row selects that group only
    await clickRow(page, 6);
    expect(await selectedIds(page)).toEqual([6, 7]);
  });

  test('nested groups, with the checkbox in the group column: shift + checkbox ranges', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await press(page, 'group-column-checkbox-on');
    await groupNestedWithCollapsedGroups(page);

    await clickRow(page, 2);
    expect(await selectedIds(page)).toEqual([]);

    await clickCheckbox(page, 3, 'group-by');
    expect(await selectedIds(page)).toEqual([2, 3]);

    await clickCheckbox(page, 7, 'group-by', ['Shift']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5, 6]);

    await clickCheckbox(page, 6, 'group-by', ['Shift']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5]);

    // a checkbox toggles the group, keeping the rest of the selection
    await clickCheckbox(page, 5, 'group-by');
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5, 6, 7, 8]);

    // from the Rust group up to TypeScript: TS 1 is in the range, the
    // expanded TypeScript and TypeScript / junior follow it
    await clickCheckbox(page, 0, 'group-by', ['Shift']);
    expect(await selectedIds(page)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);

    // space toggles the active row, like its checkbox
    await clickRow(page, 8);
    await page.keyboard.press(' ');
    expect(await selectedIds(page)).toEqual([1, 2, 3, 4, 5, 6, 8]);
  });

  test('grouped, with a checkbox column: the checkbox and space select, clicks do not', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await press(page, 'checkbox-column-on');
    await groupWithGoCollapsed(page);

    await clickRow(page, 2);
    expect(await selectedIds(page)).toEqual([]);

    await clickCheckbox(page, 2, 'selection');
    expect(await selectedIds(page)).toEqual([2]);

    await clickCheckbox(page, 7, 'selection', ['Shift']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5, 6, 7]);

    // clicks with modifiers don't select either
    await clickRow(page, 8, ['ControlOrMeta']);
    await clickRow(page, 1, ['Shift']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5, 6, 7]);

    // the active row is now row 1 (TS 1) - space toggles it
    await page.keyboard.press(' ');
    expect(await selectedIds(page)).toEqual([1, 2, 3, 4, 5, 6, 7]);

    // space on a group row toggles the whole group
    await clickRow(page, 4);
    await page.keyboard.press(' ');
    expect(await selectedIds(page)).toEqual([1, 2, 3, 6, 7]);

    // the checkbox of a group row toggles the whole group
    await clickCheckbox(page, 5, 'selection');
    expect(await selectedIds(page)).toEqual([1, 2, 3, 6, 7, 8]);
    await clickCheckbox(page, 5, 'selection');
    expect(await selectedIds(page)).toEqual([1, 2, 3]);
  });

  test('checkbox and space share the anchor', async ({ page }) => {
    await page.waitForInfinite();
    await press(page, 'checkbox-column-on');

    // checkbox on row 1, then shift+space on row 4
    await clickCheckbox(page, 1, 'selection');
    await clickRow(page, 4);
    await page.keyboard.press('Shift+ ');
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5]);

    // space on row 6, then shift+checkbox on row 7
    await clickRow(page, 6);
    await page.keyboard.press(' ');
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5, 7]);

    await clickCheckbox(page, 7, 'selection', ['Shift']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5, 7, 8]);
  });

  test('multiRowSelectionWith="click" with a checkbox column: clicks and checkboxes select', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await press(page, 'checkbox-column-on');
    await press(page, 'select-with-click');

    await clickRow(page, 1);
    expect(await selectedIds(page)).toEqual([2]);

    await clickCheckbox(page, 3, 'selection');
    expect(await selectedIds(page)).toEqual([2, 4]);

    await clickCheckbox(page, 5, 'selection', ['Shift']);
    expect(await selectedIds(page)).toEqual([2, 4, 5, 6]);

    await clickRow(page, 0);
    expect(await selectedIds(page)).toEqual([1]);

    // back to checkbox - clicks no longer select
    await press(page, 'select-with-checkbox');
    await clickRow(page, 2);
    expect(await selectedIds(page)).toEqual([1]);
  });

  test('grouped, with the checkbox in the group column: the checkbox selects, clicks do not', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await press(page, 'group-column-checkbox-on');
    await groupWithGoCollapsed(page);

    await clickRow(page, 2);
    expect(await selectedIds(page)).toEqual([]);

    await clickCheckbox(page, 4, 'group-by');
    expect(await selectedIds(page)).toEqual([4, 5]);

    await clickCheckbox(page, 2, 'group-by', ['Shift']);
    expect(await selectedIds(page)).toEqual([2, 3, 4, 5]);

    // without the checkbox, clicks select again
    await press(page, 'group-column-checkbox-off');
    await clickRow(page, 7);
    expect(await selectedIds(page)).toEqual([7]);
  });

  test('changing the configuration at runtime keeps the selection and the gestures follow it', async ({
    page,
  }) => {
    await page.waitForInfinite();

    // flat, no checkbox - clicks select
    await clickRow(page, 0);
    await clickRow(page, 1, ['Shift']);
    expect(await selectedIds(page)).toEqual([1, 2]);

    // grouped - clicks still select (they used to be locked)
    await groupWithGoCollapsed(page);
    expect(await selectedIds(page)).toEqual([1, 2]);
    await clickRow(page, 3, ['ControlOrMeta']);
    expect(await selectedIds(page)).toEqual([1, 2, 3]);

    // with a checkbox column - clicks don't select, the checkbox does
    await press(page, 'checkbox-column-on');
    await clickRow(page, 6);
    expect(await selectedIds(page)).toEqual([1, 2, 3]);
    await clickCheckbox(page, 6, 'selection');
    expect(await selectedIds(page)).toEqual([1, 2, 3, 6]);

    // flat again, keeping the checkbox column - still the checkbox, and space
    await press(page, 'ungroup');
    expect(await selectedIds(page)).toEqual([1, 2, 3, 6]);
    await clickRow(page, 7);
    expect(await selectedIds(page)).toEqual([1, 2, 3, 6]);
    await page.keyboard.press(' ');
    expect(await selectedIds(page)).toEqual([1, 2, 3, 6, 8]);
    await clickCheckbox(page, 4, 'selection');
    await clickCheckbox(page, 6, 'selection', ['Shift']);
    expect(await selectedIds(page)).toEqual([1, 2, 3, 5, 6, 7, 8]);

    // without the checkbox column - clicks select again
    await press(page, 'checkbox-column-off');
    await clickRow(page, 7);
    expect(await selectedIds(page)).toEqual([8]);
  });
});
