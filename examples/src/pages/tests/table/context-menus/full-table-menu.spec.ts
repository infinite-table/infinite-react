import { test, expect } from '@testing';

export default test.describe.parallel('Table Context Menu', () => {
  test('should work for all locations in table body', async ({
    page,
    columnModel,
    menuModel,
  }) => {
    await page.waitForInfinite();

    let locator = columnModel.getCellLocator({
      rowIndex: 0,
      colId: 'currency',
    });

    await locator.click({
      button: 'right',
    });

    expect(await menuModel.getTextForCell('col:currency')).toBe('hi USD');

    await columnModel
      .getCellLocator({
        rowIndex: 1,
        colId: 'firstName',
      })
      .click({
        button: 'right',
      });

    expect(await menuModel.getTextForCell('col:firstName')).toBe('hi Marry');
    expect(await menuModel.isMenuOpen()).toBe(true);

    await page.locator('.InfiniteBody').click({
      button: 'right',
    });

    expect(await menuModel.getTextForCell('generic2')).toBe(
      'Generic menu item two',
    );

    expect(await menuModel.isMenuOpen()).toBe(true);
  });
});
