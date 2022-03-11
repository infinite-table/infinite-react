import { getColumnCells } from '../../../testUtils';
import { rowData } from './rowData';

import { test, expect, ElementHandle } from '@playwright/test';

export default test.describe.parallel('Virtualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/virtualization/range`);
  });

  test('should display first row correctly', async ({ page }) => {
    await page.waitForTimeout(50);
    let { bodyCells } = await getColumnCells('model', { page });

    let values = await Promise.all(
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values[0]).toEqual(rowData[0].model); // Celica
  });
});
