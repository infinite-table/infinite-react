import { test, expect } from '@testing';

export default test.describe
  .parallel('Multi-column groupColumn.renderGroupIcon', () => {
  test('is called only where a group icon belongs, with the default icon', async ({
    page,
  }) => {
    await page.waitForInfinite();

    // all expanded: Australia, Go, Ana, Java, John, Brazil, Go, Emma
    // each group row has one icon, in its own level's column
    const custom = page.locator('[data-name="custom-group-icon"]');
    await expect(custom).toHaveCount(5);
    await expect(
      custom.locator('[data-name="expand-collapse-icon"]'),
    ).toHaveCount(5);

    await custom.first().locator('[data-name="expand-collapse-icon"]').click();
    // Australia collapsed: Australia, Brazil, Go, Emma
    await expect(custom).toHaveCount(3);
  });
});
