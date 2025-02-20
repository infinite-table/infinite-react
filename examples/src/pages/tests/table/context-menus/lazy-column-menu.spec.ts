import { test, expect } from '@testing';

export default test.describe.parallel('Lazy Context Menu', () => {
  test('should work for cells', async ({ page, columnModel, menuModel }) => {
    await page.waitForInfinite();

    let locator = columnModel.getCellLocator({
      rowIndex: 0,
      colId: 'currency',
    });

    await locator.click({
      button: 'right',
    });

    expect(await menuModel.getTextForCell('money')).toBe('Currency USD');

    await columnModel
      .getCellLocator({
        rowIndex: 0,
        colId: 'firstName',
      })
      .click({
        button: 'right',
      });

    const menuLocator = menuModel.getMenuLocator();

    // wait for the menu to be visible
    await expect(menuLocator).toBeVisible();
    expect(await menuModel.getTextForCell('hi')).toBe('hi John');
    expect(await menuModel.isMenuOpen()).toBe(true);

    //clicking in the age column should close the menu and not open a new one
    await columnModel
      .getCellLocator({
        rowIndex: 0,
        colId: 'age',
      })
      .click({
        button: 'right',
      });

    expect(await menuModel.isMenuOpen()).toBe(false);
  });
});
