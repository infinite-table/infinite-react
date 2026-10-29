import { test, expect } from '@testing';
import type { Page, TestPage } from '@testing';

// leaves 11 and 121 are filtered out
const ALL_LEAVES = ['10', '11', '120', '121', '20'];
const VISIBLE_LEAVES = ['10', '120', '20'];

const ROW_COUNT = 8;
const FILTERED_ROW_COUNT = 6;

const checkboxSelector = (rowIndex: number | 'header') =>
  rowIndex === 'header'
    ? '.InfiniteHeaderCell[data-column-id="name"] input[type="checkbox"]'
    : `.InfiniteColumnCell[data-column-id="name"][data-row-index="${rowIndex}"] input[type="checkbox"]`;

const checkboxState = (page: Page, rowIndex: number | 'header') =>
  page
    .locator(checkboxSelector(rowIndex))
    .evaluate((input: HTMLInputElement) =>
      input.indeterminate ? null : input.checked,
    );

const clickCheckbox = (page: Page, rowIndex: number | 'header') =>
  page.locator(checkboxSelector(rowIndex)).click();

const renderedRows = (page: Page) =>
  page.locator('.InfiniteColumnCell[data-column-id="name"]').count();

async function setFiltered(page: Page, filtered: boolean) {
  await page.evaluate((f) => (globalThis as any).setFiltered(f), filtered);
  await expect
    .poll(() => renderedRows(page))
    .toBe(filtered ? FILTERED_ROW_COUNT : ROW_COUNT);
}

/**
 * Removes the filter, so the selected leaves that were filtered out are also returned
 */
async function selectedLeafIds(page: Page) {
  await setFiltered(page, false);
  return page.evaluate(() =>
    (globalThis as any).DATA_SOURCE_API.treeApi
      .getSelectedLeafNodePaths()
      .map((path: string[]) => path[path.length - 1])
      .sort(),
  );
}

async function setup(page: TestPage, target: 'all' | 'visible') {
  await page.waitForInfinite();
  await page.evaluate((t) => (globalThis as any).setTarget(t), target);
  await expect.poll(() => renderedRows(page)).toBe(ROW_COUNT);
}

export default test.describe.parallel('Tree multiRowSelectionTarget', () => {
  for (const target of ['all', 'visible'] as const) {
    const expectedAfterSelectAll =
      target === 'all' ? ALL_LEAVES : VISIBLE_LEAVES;

    test(`header checkbox with filtered out leaves - ${target}`, async ({
      page,
    }) => {
      await setup(page, target);
      await setFiltered(page, true);

      await clickCheckbox(page, 'header');
      await expect.poll(() => checkboxState(page, 'header')).toBe(true);

      expect(await selectedLeafIds(page)).toEqual(expectedAfterSelectAll);
    });

    test(`header checkbox keeps filtered out selection - ${target}`, async ({
      page,
    }) => {
      await setup(page, target);
      // notes.txt (11), which the filter will hide
      await clickCheckbox(page, 2);
      await setFiltered(page, true);

      expect(await checkboxState(page, 'header')).toBe(
        target === 'all' ? null : false,
      );

      await clickCheckbox(page, 'header');
      await expect.poll(() => checkboxState(page, 'header')).toBe(true);
      await clickCheckbox(page, 'header');
      await expect.poll(() => checkboxState(page, 'header')).toBe(false);

      expect(await selectedLeafIds(page)).toEqual(
        target === 'all' ? [] : ['11'],
      );
    });

    test(`parent checkbox with filtered out leaves - ${target}`, async ({
      page,
    }) => {
      await setup(page, target);
      await setFiltered(page, true);

      // the "Pictures" node, where mountain.png (121) is filtered out
      await clickCheckbox(page, 2);
      await expect.poll(() => checkboxState(page, 2)).toBe(true);
      // the "Documents" node also has notes.txt (11) filtered out
      expect(await checkboxState(page, 0)).toBe(null);

      expect(await selectedLeafIds(page)).toEqual(
        target === 'all' ? ['120', '121'] : ['120'],
      );
      // "Pictures"
      expect(await checkboxState(page, 3)).toBe(
        target === 'all' ? true : null,
      );
    });

    test(`all visible leaves selected - ${target}`, async ({ page }) => {
      await setup(page, target);
      await setFiltered(page, true);

      // report.docx (10), beach.jpg (120) and todo.docx (20)
      for (const rowIndex of [1, 3, 5]) {
        await clickCheckbox(page, rowIndex);
        await expect.poll(() => checkboxState(page, rowIndex)).toBe(true);
      }

      expect(await checkboxState(page, 'header')).toBe(
        target === 'all' ? null : true,
      );
      // "Documents"
      expect(await checkboxState(page, 0)).toBe(
        target === 'all' ? null : true,
      );
    });

    test(`treeApi.selectAll with filtered out leaves - ${target}`, async ({
      page,
    }) => {
      await setup(page, target);
      await setFiltered(page, true);

      await page.evaluate(() =>
        (globalThis as any).DATA_SOURCE_API.treeApi.selectAll(),
      );
      await expect.poll(() => checkboxState(page, 'header')).toBe(true);

      expect(await selectedLeafIds(page)).toEqual(expectedAfterSelectAll);
    });
  }
});
