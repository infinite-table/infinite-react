import { test, expect } from '@testing';
import type { Page } from '@playwright/test';

async function expectMenuOutsideTheTable(page: Page) {
  const menu = page.locator('[data-name="portal"] .InfiniteMenu');
  await expect(menu).toBeVisible();

  const menuBox = (await menu.boundingBox())!;
  const clipBox = (await page.locator('[data-name="clip"]').boundingBox())!;
  const constrainBox = (await page
    .locator('[data-name="constrain"]')
    .boundingBox())!;

  expect(menuBox.y + menuBox.height).toBeGreaterThan(
    clipBox.y + clipBox.height,
  );

  expect(menuBox.x).toBeGreaterThanOrEqual(constrainBox.x);
  expect(menuBox.y).toBeGreaterThanOrEqual(constrainBox.y);
  expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(
    constrainBox.x + constrainBox.width,
  );
  expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(
    constrainBox.y + constrainBox.height,
  );

  // the part of the menu below the table is not clipped
  const bottomIsVisible = await page.evaluate(
    ({ x, y }) => !!document.elementFromPoint(x, y)?.closest('.InfiniteMenu'),
    { x: menuBox.x + menuBox.width / 2, y: menuBox.y + menuBox.height - 4 },
  );
  expect(bottomIsVisible).toBe(true);
}

export default test.describe.parallel('menuPortalContainer', () => {
  test('column menu is rendered in the portal container and constrained to menuConstrainTo', async ({
    page,
    headerModel,
  }) => {
    await page.waitForInfinite();

    await headerModel.openColumnMenu('firstName');

    await expectMenuOutsideTheTable(page);
  });

  test('cell context menu is rendered in the portal container and constrained to menuConstrainTo', async ({
    page,
    columnModel,
  }) => {
    await page.waitForInfinite();

    await columnModel
      .getCellLocator({ rowIndex: 0, colId: 'firstName' })
      .click({ button: 'right' });

    await expectMenuOutsideTheTable(page);
  });
});
