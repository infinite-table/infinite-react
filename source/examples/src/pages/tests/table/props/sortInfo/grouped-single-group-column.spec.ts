import { getCellNodeLocator } from '../../../testUtils';

import { expect, test, Page } from '@testing';

async function getRowGroupNesting(rowIndex: number, page: Page) {
  const cell = getCellNodeLocator({ colIndex: 0, rowIndex }, { page });

  return await cell
    .locator('svg[data-name="expander-icon"]')
    .evaluate(
      (node) => getComputedStyle(node.parentElement!).paddingInlineStart,
    );
}
export default test.describe.parallel('Sorting group column', () => {
  test('grouping should have correct indentation', async ({ page }) => {
    await page.waitForInfinite();

    expect(await getRowGroupNesting(0, page)).toBe('0px');
    expect(await getRowGroupNesting(1, page)).toBe('30px');
  });
});
