import { test, expect } from '@testing';

export default test.describe.parallel('useInfinitePortalContainer', () => {
  test('renders into the grid portal, aligned with alignNode', async ({
    page,
    headerModel,
  }) => {
    await page.waitForInfinite();

    await page.locator('[data-name="toggle-popup"]').click();

    const popup = page.locator('[data-name="popup"]');
    await expect(popup).toBeVisible();

    // the popup is inside the grid's portal element
    expect(
      await popup.evaluate((node) =>
        node.parentElement?.classList.contains('InfinitePortal'),
      ),
    ).toBe(true);

    // its top right corner is at the bottom right corner of the header
    const header = await headerModel
      .getHeaderCellLocator({ colId: 'name' })
      .boundingBox();
    await expect
      .poll(async () => {
        const box = await popup.boundingBox();
        return [
          Math.round(box!.y - (header!.y + header!.height)),
          Math.round(box!.x + box!.width - (header!.x + header!.width)),
        ];
      })
      .toEqual([0, 0]);

    await page.locator('[data-name="toggle-popup"]').click();
    await expect(popup).toHaveCount(0);
  });
});
