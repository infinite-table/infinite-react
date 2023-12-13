import { test, expect } from '@testing';

export default test.describe.parallel('Table Context Menu', () => {
  test('should work for all locations in table body', async ({
    page,
    columnModel,
    menuModel,
  }) => {
    async function showGenericMenu() {
      return await page.locator('.InfiniteBody').click({
        button: 'right',
      });
    }

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

    showGenericMenu();

    expect(await menuModel.isMenuOpen()).toBe(true);

    const itemThatHides = page.getByText('Generic menu hides via api call');
    await itemThatHides.click();
    expect(await menuModel.isMenuOpen()).toBe(false);

    await showGenericMenu();
    expect(await menuModel.isMenuOpen()).toBe(true);

    const autoHideItem = page.getByText('Generic menu item with item.autohide');
    await autoHideItem.click();
    expect(await menuModel.isMenuOpen()).toBe(false);

    await showGenericMenu();
    expect(await menuModel.isMenuOpen()).toBe(true);
    const autoHideItem2 = page.getByText('Generic menu item hide via arg call');
    await autoHideItem2.click();
    expect(await menuModel.isMenuOpen()).toBe(false);

    await showGenericMenu();
    expect(await menuModel.isMenuOpen()).toBe(true);
    const persistentItem = page.getByText('Generic menu item persistent');
    await persistentItem.click();
    expect(await menuModel.isMenuOpen()).toBe(true);

    // click somewhere else to close menu
    await page.click('body');
    expect(await menuModel.isMenuOpen()).toBe(false);
  });
});
