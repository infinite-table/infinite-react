import { test, expect } from '@playwright/test';

import { getValuesByColumnId } from '../../../testUtils';

import { rowData } from './rowData';

export default test.describe.parallel('Virtualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/virtualization/range`);
  });

  test('should display first row correctly', async ({ page }) => {
    await page.waitForTimeout(50);
    const values = await getValuesByColumnId('model', { page });

    expect(values[0]).toEqual(rowData[0].model); // Celica
  });
});
