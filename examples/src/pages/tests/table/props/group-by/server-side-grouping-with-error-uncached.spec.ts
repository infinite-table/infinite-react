import { getCellNodeLocator } from '@examples/pages/tests/testUtils';
import { test, expect } from '@testing';

export default test.describe.parallel('Server-side grouping with error', () => {
  test('should expand correctly a group with no errors', async ({ page }) => {
    await page.waitForInfinite();
    const firstCell = getCellNodeLocator(
      {
        colId: 'group-by',
        rowIndex: 0,
      },
      { page },
    );

    const usaText = await firstCell.innerText();
    const canadaText = await getCellNodeLocator(
      {
        colId: 'group-by',
        rowIndex: 1,
      },
      { page },
    ).innerText();

    const franceText = await getCellNodeLocator(
      {
        colId: 'group-by',
        rowIndex: 2,
      },
      { page },
    ).innerText();

    expect(usaText).toEqual('USA');
    expect(canadaText).toEqual('Canada - will error on expand');
    expect(franceText).toEqual('France');

    // now expand USA - will expand correctly
    await getCellNodeLocator(
      {
        colId: 'group-by',
        rowIndex: 0,
      },
      { page },
    )
      .locator('svg')
      .click();

    const firstChild = await getCellNodeLocator(
      {
        colId: 'group-by',
        rowIndex: 1,
      },
      { page },
    ).innerText();
    const secondChild = await getCellNodeLocator(
      {
        colId: 'group-by',
        rowIndex: 2,
      },
      { page },
    ).innerText();

    expect(firstChild).toEqual('New York');
    expect(secondChild).toEqual('San Francisco');
  });

  test('should have (uncached) error when appropriate', async ({ page }) => {
    await page.waitForInfinite();

    const canadaToggleIcon = getCellNodeLocator(
      {
        colId: 'group-by',
        rowIndex: 1,
      },
      { page },
    ).locator('svg');

    await canadaToggleIcon.click();

    const canadaCell = getCellNodeLocator(
      {
        colId: 'group-by',
        rowIndex: 1,
      },
      { page },
    );

    expect(await canadaCell.innerText()).toEqual(
      'Cannot load children for Canada',
    );

    // we toggle it back to collapsed
    await canadaToggleIcon.click();

    // and we should be back to normal, since the group node (and thus the error as well) was not cached
    expect(await canadaCell.innerText()).toEqual(
      'Canada - will error on expand',
    );
  });
});
