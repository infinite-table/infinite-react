import { test, expect } from '@playwright/test';

import { mapListElements } from '../testUtils/listUtils';

const arr = (size: number) => {
  return [...new Array(size)].map((_, i) => `#${i}`);
};
export default test.describe.parallel('RawList-Horizontal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/lists/raw-list-horizontal`);
  });

  test('should correctly render on scroll', async ({ page }) => {
    await page.waitForTimeout(20);

    let result = await mapListElements((el) => el.textContent, undefined, {
      page,
    });
    expect(result).toEqual(arr(12));

    // click button to render less items
    await page.click('button');
    await page.waitForTimeout(20);

    result = await mapListElements((el) => el.textContent, undefined, { page });
    expect(result).toEqual(arr(8));

    // click button again to go to initial state
    await page.click('button');
    await page.waitForTimeout(20);

    result = await mapListElements((el) => el.textContent, undefined, { page });
    expect(result).toEqual(arr(12));
  });
});
