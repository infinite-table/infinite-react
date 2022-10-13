import { test, expect } from '@testing';

import { rowData } from './rowData';

export default test.describe.parallel('Virtualization', () => {
  test('should display first row correctly', async ({ page, rowModel }) => {
    await page.waitForInfinite();
    const values = await rowModel.getTextForColumnCells({ colId: 'model' });

    expect(values[0]).toEqual(rowData[0].model); // Celica
  });
});
