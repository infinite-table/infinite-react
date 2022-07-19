import {
  getActiveCellIndicatorLocator,
  getCellNodeLocator,
} from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('keyboard navigation = false', () => {
  test('works correctly', async ({ page }) => {
    await page.waitForInfinite();
    const cell = getCellNodeLocator(
      {
        rowIndex: 5,
        colIndex: 4,
      },
      { page },
    );

    await cell.click();

    const indicator = getActiveCellIndicatorLocator({ page });

    expect(await indicator.isHidden()).toBe(true);
  });
});
