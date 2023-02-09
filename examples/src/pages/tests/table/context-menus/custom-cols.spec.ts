import { test, expect } from '@testing';

export default test.describe.parallel('Context Menu Custom columns', () => {
  test('should work for cells', async ({ page, columnModel, menuModel }) => {
    await page.waitForInfinite();

    let locator = columnModel.getCellLocator({
      rowIndex: 0,
      colId: 'currency',
    });

    await locator.click({
      button: 'right',
    });

    expect(
      await menuModel.getTextForCell({ rowKey: 'money', colName: 'label' }),
    ).toBe('Currency USD');

    expect(
      await menuModel.getTextForCell({
        rowKey: 'money2',
        colName: 'cellValue',
      }),
    ).toBe('USD!');

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
  });
});
