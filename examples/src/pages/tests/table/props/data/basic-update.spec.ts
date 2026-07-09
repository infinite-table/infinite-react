import { expect, Page, test } from '@testing';

const getBodyCellRenderCounts = async (page: Page) => {
  return await page.$$eval(
    '.InfiniteColumnCell[data-row-index][data-column-id]:not(.InfiniteDetachedCell)',
    (cells: HTMLElement[]) => {
      return cells.reduce((acc, cell) => {
        const rowIndex = cell.dataset.rowIndex;
        const columnId = cell.dataset.columnId;
        const renderCount = cell.dataset.renderCount;

        if (!rowIndex || !columnId || !renderCount) {
          return acc;
        }

        acc[`${rowIndex}:${columnId}`] = Number(renderCount);
        return acc;
      }, {} as Record<string, number>);
    },
  );
};

export default test.describe.parallel('Basic data update', () => {
  test('via API should not rerender header', async ({ page, headerModel }) => {
    await page.waitForInfinite();

    const salaryHeader = headerModel.getHeaderCellLocator({ colId: 'salary' });
    const salaryInitialText = await salaryHeader.textContent();

    const updateButton = page.getByRole('button', {
      name: 'update',
      exact: true,
    });

    await updateButton.click();

    expect(await salaryHeader.textContent()).toBe(salaryInitialText);
  });

  test('via API should rerender only cells in the updated row', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();

    await tableModel
      .withCell({ rowIndex: 0, colId: 'salary' })
      .getLocator()
      .click();
    await page.evaluate(() => new Promise(requestAnimationFrame));

    const initialCounts = await getBodyCellRenderCounts(page);
    const initialSalaryValue = await tableModel
      .withCell({ rowIndex: 0, colId: 'salary' })
      .getValue();

    await page.getByRole('button', { name: 'update', exact: true }).click();

    await expect
      .poll(async () => {
        return await tableModel
          .withCell({ rowIndex: 0, colId: 'salary' })
          .getValue();
      })
      .not.toBe(initialSalaryValue);

    const updatedCounts = await getBodyCellRenderCounts(page);

    for (const [cellKey, initialCount] of Object.entries(initialCounts)) {
      if (cellKey.startsWith('0:')) {
        expect(updatedCounts[cellKey], cellKey).toBeGreaterThan(initialCount);
      } else {
        expect(updatedCounts[cellKey], cellKey).toBe(initialCount);
      }
    }
  });
});
