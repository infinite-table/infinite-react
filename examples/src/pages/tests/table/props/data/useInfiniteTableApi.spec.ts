import { test, expect } from '@testing';

export default test.describe.parallel('useInfiniteTableApi', () => {
  test('works ', async ({
    page,

    columnModel,
  }) => {
    await page.waitForInfinite();
    const locator = page.getByTestId('clicked-id');
    const firstNameLocator = page.getByTestId('clicked-firstName');

    expect(await locator.innerText()).toBe('clicked id:');
    const firstCell = columnModel.getCellLocator({
      rowIndex: 1,
      colId: 'identifier',
    });

    const firstNameCell = columnModel.getCellLocator({
      rowIndex: 1,
      colId: 'firstName',
    });

    await firstCell.locator('button').click();
    await firstNameCell.locator('button').click();

    const clickedId = await locator.innerText();
    expect(clickedId).toBe('clicked id: 1');
    expect(await firstNameLocator.innerText()).toBe('clicked firstName: Axel');
  });
});
