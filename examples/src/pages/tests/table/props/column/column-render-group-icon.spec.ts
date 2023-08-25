import { test, expect } from '@testing';

export default test.describe.parallel('Custom group icon', () => {
  test('should be able to toggle group', async ({
    page,

    tableModel,
    apiModel: apiModel,
  }) => {
    await page.waitForInfinite();

    const col = tableModel.withColumn('group-by');

    let firstCell = await col.getCellValue(0);
    let secondCell = await col.getCellValue(1);

    expect(firstCell).toBe('Grouped by\nbackend');
    expect(secondCell).toBe('');

    await apiModel.evaluate((api) => {
      const toggle = api.toggleGroupRow;

      toggle(['backend']);
    });

    secondCell = await col.getCellValue(1);
    expect(secondCell).toBe('Grouped by\nfrontend');
  });
});
