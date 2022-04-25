import { getCellNode } from '@examples/pages/tests/testUtils';
import { test, expect } from '@testing';

export default test.describe.parallel('RawList', () => {
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
