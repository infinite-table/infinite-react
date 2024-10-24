import { getCellNodeLocator } from '../../../testUtils';

import { expect, test, Page } from '@testing';

import { data } from './grouped-single-group-column.data';

async function getRowGroupNesting(rowIndex: number, page: Page) {
  const cell = getCellNodeLocator({ colIndex: 0, rowIndex }, { page });

  return await cell
    .locator('svg[data-name="expander-icon"]')
    .evaluate(
      (node) => getComputedStyle(node.parentElement!).paddingInlineStart,
    );
}

const expectedSortedAscValues = [
  'backend',
  'Go',
  'Rust',
  'frontend',
  'JavaScript',
  'TypeScript',
];

const expectedSortedDescValues = [
  'frontend',
  'TypeScript',
  'JavaScript',
  'backend',
  'Rust',
  'Go',
];

const stack = new Set<string>();
const langPerStack = new Map<string, Set<string>>();
data.forEach((row) => {
  stack.add(row.stack);

  if (!langPerStack.has(row.stack)) {
    langPerStack.set(row.stack, new Set<string>());
  }
  const langSet = langPerStack.get(row.stack)!;

  langSet.add(row.preferredLanguage);
});

const expectedUnsortedValues = Array.from(stack).flatMap((stack) => {
  return [stack, ...Array.from(langPerStack.get(stack)!)];
});

export default test.describe.parallel('Sorting group column', () => {
  test('grouping should have correct indentation', async ({ page }) => {
    await page.waitForInfinite();

    expect(await getRowGroupNesting(0, page)).toBe('0px');
    expect(await getRowGroupNesting(1, page)).toBe('24px');
  });
  test('sorting group column via column header click should work', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();
    const col = tableModel.withColumn('group-by');

    // it's sorted asc by default so expect the values to be sorted
    let values = await col.getValues();
    expect(values.filter(Boolean)).toEqual(expectedSortedAscValues);

    await col.clickToSort();
    values = await col.getValues();
    expect(values.filter(Boolean)).toEqual(expectedSortedDescValues);

    await col.clickToSort();
    values = await col.getValues();
    expect(values.filter(Boolean)).toEqual(expectedUnsortedValues);

    await col.clickToSort();
    values = await col.getValues();
    expect(values.filter(Boolean)).toEqual(expectedSortedAscValues);
  });

  test('sorting group column via column menu click should work', async ({
    page,
    tableModel,
    headerModel,
  }) => {
    await page.waitForInfinite();

    // it's sorted asc by default
    const col = tableModel.withColumn('group-by');

    let values = await col.getValues();
    expect(values.filter(Boolean)).toEqual(expectedSortedAscValues);

    await headerModel.clickColumnMenuItem('group-by', 'sort-desc');
    values = await col.getValues();
    expect(values.filter(Boolean)).toEqual(expectedSortedDescValues);

    await headerModel.clickColumnMenuItem('group-by', 'sort-none');
    values = await col.getValues();
    expect(values.filter(Boolean)).toEqual(expectedUnsortedValues);

    await headerModel.clickColumnMenuItem('group-by', 'sort-asc');
    values = await col.getValues();
    expect(values.filter(Boolean)).toEqual(expectedSortedAscValues);
  });
});
