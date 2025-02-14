import { test, expect } from '@testing';

export default test.describe
  .parallel('tree virtualization with pinned col', () => {
  /**
   * the scenario for this bug is this:
   * only 4 rows are rendered - though if the table would be fully populated, it
   * would render more virtualized rows
   *
   * so expanding all tree nodes makes more virtualized rows render.
   * this is the scenario we have to address.
   *
   * To reproduce the bug, hit "Expand all" button.
   *
   * Then scroll all the way down and all the way to the right.
   *
   * All cells should be properly rendered, however, the cell
   * at the bottom right is not there.
   */
  test('should work when the number of rows to render is growing', async ({
    page,
    apiModel,
    tableModel,
  }) => {
    await page.waitForInfinite();

    await page.click('button:has-text("Expand all")');

    await apiModel.evaluate((api) => {
      api.scrollTop = 2100;
    });
    await page.waitForTimeout(50);
    await apiModel.evaluate((api) => {
      api.scrollLeft = 1100;
    });
    await page.waitForTimeout(50);

    expect(
      await tableModel
        .withCell({
          rowIndex: 29,
          colId: 'permissions',
        })
        .isVisible(),
    ).toEqual(true);
  });

  test('should work when the number of rows to render is shrinking', async ({
    page,
    tableModel,
    apiModel,
  }) => {
    await page.waitForInfinite();

    expect(
      await tableModel
        .withCell({
          rowIndex: 4,
          colId: 'name',
        })
        .isVisible(),
    ).toEqual(false);
    expect(
      await tableModel
        .withCell({
          rowIndex: 4,
          colId: 'type',
        })
        .isVisible(),
    ).toEqual(false);
    expect(
      await tableModel
        .withCell({
          rowIndex: 4,
          colId: 'extension',
        })
        .isVisible(),
    ).toEqual(false);

    await page.click('button:has-text("Expand all")');
    await page.click('button:has-text("Collapse all")');

    expect(
      await tableModel
        .withCell({
          rowIndex: 4,
          colId: 'name',
        })
        .isVisible(),
    ).toEqual(false);
    expect(
      await tableModel
        .withCell({
          rowIndex: 4,
          colId: 'type',
        })
        .isVisible(),
    ).toEqual(false);
    expect(
      await tableModel
        .withCell({
          rowIndex: 4,
          colId: 'extension',
        })
        .isVisible(),
    ).toEqual(false);

    await apiModel.evaluate((api) => {
      api.scrollLeft = 2000;
    });
    await page.waitForTimeout(50);

    expect(
      await tableModel
        .withCell({
          rowIndex: 3,
          colId: 'permissions',
        })
        .isVisible(),
    ).toEqual(true);
  });
});
