import { test, expect, Page } from '@testing';

const COLUMN_HEADER_HEIGHT = 40;

async function getHeaderInfo(page: Page) {
  return await page.evaluate(() => {
    const rectOf = (node: Element | null | undefined) => {
      const rect = node?.getBoundingClientRect();
      return rect
        ? { top: Math.round(rect.top), height: Math.round(rect.height) }
        : null;
    };
    const header = document.querySelector('.InfiniteHeader');
    const headerRect = rectOf(header)!;

    const columnHeader = (colId: string) => {
      const rect = rectOf(
        header?.querySelector(
          `.InfiniteHeaderCell[data-column-id="${colId}"]`,
        ),
      );
      return rect
        ? { top: rect.top - headerRect.top, height: rect.height }
        : null;
    };

    return {
      header: headerRect.height,
      // not in a column group, so it spans all the header rows
      id: columnHeader('id'),
      // in a first-level column group
      name: columnHeader('name'),
      // in a second-level column group
      stargazers_count: columnHeader('stargazers_count'),
    };
  });
}

const H = COLUMN_HEADER_HEIGHT;

const WITH_COLUMN_GROUPS = {
  header: 3 * H,
  id: { top: 0, height: 3 * H },
  name: { top: H, height: 2 * H },
  stargazers_count: { top: 2 * H, height: H },
};

async function goToView(page: Page, view: 'Flat' | 'Grouped' | 'Pivot') {
  await page.getByRole('button', { name: view, exact: true }).click();
}

async function expectPivotHeader(page: Page) {
  // pivoting by one field, with two aggregations, gives two header rows
  await expect
    .poll(async () => (await getHeaderInfo(page)).header)
    .toEqual(2 * H);
}

export default test.describe('Leaving pivot mode, with columnGroups', () => {
  test('goes back to the depth of the column groups, when grouping is removed as well', async ({
    page,
  }) => {
    await page.waitForInfinite();

    expect(await getHeaderInfo(page)).toEqual(WITH_COLUMN_GROUPS);

    await goToView(page, 'Pivot');
    await expectPivotHeader(page);

    await goToView(page, 'Flat');
    await expect
      .poll(async () => await getHeaderInfo(page))
      .toEqual(WITH_COLUMN_GROUPS);
  });

  test('goes back to the depth of the column groups, when grouping stays', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await goToView(page, 'Pivot');
    await expectPivotHeader(page);

    await goToView(page, 'Grouped');
    await expect
      .poll(async () => await getHeaderInfo(page))
      .toEqual(WITH_COLUMN_GROUPS);
  });
});
