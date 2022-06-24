import { getActiveCellIndicatorOffsetFromDOM } from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('Default active cell index', () => {
  test('works correctly even with lazy data', async ({ page }) => {
    await page.waitForInfinite();

    const offset = await getActiveCellIndicatorOffsetFromDOM({ page });

    // 400 to the left (2 columns)
    // 0 vertical offset, since the first row is selected
    expect(offset).toEqual(['calc( 0px + 400px )', 'calc( 0px + 0px )']);
  });
});
