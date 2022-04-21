import { getCellNode } from '@examples/pages/tests/testUtils';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('RawList', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/row-height/cssvar1`);
  });

  test('should correctly render rows', async ({ page }) => {
    await page.waitForTimeout(20);

    const row = await getCellNode({ rowIndex: 0, columnId: 'Id' }, { page });

    const height = await page.evaluate(
      //@ts-ignore
      (r) => r.getBoundingClientRect().height,
      row,
    );

    expect(height).toEqual(90);
  });
});
