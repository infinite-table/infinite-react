import { test, expect } from '@testing';
import { Page } from '@playwright/test';

async function getRowSelection(page: Page) {
  return await page.evaluate(() => (globalThis as any).rowSelection);
}

function cell(page: Page, rowIndex: number, colId: string) {
  return page.locator(
    `.InfiniteColumnCell[data-row-index="${rowIndex}"][data-column-id="${colId}"]:not(.InfiniteDetachedCell)`,
  );
}

async function rowId(page: Page, rowIndex: number) {
  return Number(await cell(page, rowIndex, 'id').textContent());
}

export default test.describe.parallel(
  'Lazy grouping with group keys - click selection',
  () => {
    test('clicks select groups and rows with group key paths', async ({
      page,
      rowModel,
    }) => {
      await page.waitForInfinite();

      await expect(cell(page, 0, 'group-by')).toContainText('backend');
      await expect(cell(page, 1, 'group-by')).toContainText('frontend');

      // click the (collapsed) frontend group row
      await cell(page, 1, 'id').click();
      expect((await getRowSelection(page)).selectedRows).toEqual([
        ['frontend'],
      ]);

      // cmd+click the backend group row as well
      await cell(page, 0, 'id').click({ modifiers: ['ControlOrMeta'] });
      expect((await getRowSelection(page)).selectedRows).toEqual(
        expect.arrayContaining([['backend'], ['frontend']]),
      );

      // expand backend and click its first row
      await rowModel.toggleGroupRow(0);
      await expect(cell(page, 1, 'id')).not.toHaveText('');
      const firstId = await rowId(page, 1);
      const secondId = await rowId(page, 2);
      const thirdId = await rowId(page, 3);

      await cell(page, 1, 'id').click();
      expect((await getRowSelection(page)).selectedRows).toEqual([
        ['backend', firstId],
      ]);

      // shift+click the third row
      await cell(page, 3, 'id').click({ modifiers: ['Shift'] });
      let { selectedRows } = await getRowSelection(page);
      expect(selectedRows).toHaveLength(3);
      expect(selectedRows).toEqual(
        expect.arrayContaining([
          ['backend', firstId],
          ['backend', secondId],
          ['backend', thirdId],
        ]),
      );

      // shift+checkbox-click on the second row shrinks the range
      await cell(page, 2, 'group-by')
        .locator('input[type="checkbox"]')
        .click({ modifiers: ['Shift'] });
      ({ selectedRows } = await getRowSelection(page));
      expect(selectedRows).toHaveLength(2);
      expect(selectedRows).toEqual(
        expect.arrayContaining([
          ['backend', firstId],
          ['backend', secondId],
        ]),
      );
    });
  },
);
