import { test, expect, Page } from '@testing';

const COLUMN_HEADER_HEIGHT = 40;

async function getHeights(page: Page) {
  return await page.evaluate(() => {
    const heightOf = (node: Element | null) =>
      Math.round(node?.getBoundingClientRect().height ?? -1);

    return {
      header: heightOf(document.querySelector('.InfiniteHeader')),
      // header cells are absolutely positioned, so a cell that's taller than
      // the header would not make the header taller
      tallestHeaderCell: Math.max(
        ...Array.from(
          document.querySelectorAll('.InfiniteHeader .InfiniteHeaderCell'),
        ).map(heightOf),
      ),
    };
  });
}

const ONE_ROW = {
  header: COLUMN_HEADER_HEIGHT,
  tallestHeaderCell: COLUMN_HEADER_HEIGHT,
};

async function goToView(page: Page, view: 'Flat' | 'Grouped' | 'Pivot') {
  await page.getByRole('button', { name: view, exact: true }).click();
}

async function expectPivotHeader(page: Page) {
  // pivoting by one field, with two aggregations, gives two header rows
  await expect
    .poll(async () => (await getHeights(page)).header)
    .toEqual(2 * COLUMN_HEADER_HEIGHT);
}

export default test.describe('Leaving pivot mode, with no columnGroups', () => {
  test('restores the header height when going back to no grouping', async ({
    page,
  }) => {
    await page.waitForInfinite();

    expect(await getHeights(page)).toEqual(ONE_ROW);

    await goToView(page, 'Pivot');
    await expectPivotHeader(page);

    await goToView(page, 'Flat');
    await expect.poll(async () => await getHeights(page)).toEqual(ONE_ROW);

    // and again, to make sure it also works on later round trips
    await goToView(page, 'Pivot');
    await expectPivotHeader(page);

    await goToView(page, 'Flat');
    await expect.poll(async () => await getHeights(page)).toEqual(ONE_ROW);
  });

  test('restores the header height when going back to grouping without pivot', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await goToView(page, 'Pivot');
    await expectPivotHeader(page);

    await goToView(page, 'Grouped');
    await expect.poll(async () => await getHeights(page)).toEqual(ONE_ROW);

    await goToView(page, 'Pivot');
    await expectPivotHeader(page);

    await goToView(page, 'Grouped');
    await expect.poll(async () => await getHeights(page)).toEqual(ONE_ROW);
  });
});
