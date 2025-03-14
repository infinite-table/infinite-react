import { test, expect } from '@testing';

export default test.describe.parallel('Context Menu', () => {
  test('should work for cells', async ({ page, columnModel, menuModel }) => {
    await page.waitForInfinite();

    let currencyRow0 = columnModel.getCellLocator({
      rowIndex: 0,
      colId: 'currency',
    });

    await currencyRow0.click({
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

    // clicking the noMenu column should not open a menu
    await columnModel
      .getCellLocator({
        rowIndex: 0,
        colId: 'noMenu',
      })
      .click({
        button: 'right',
      });

    expect(await menuModel.isMenuOpen()).toBe(false);
  });
});
