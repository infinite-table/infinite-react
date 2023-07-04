import { test, expect } from '@testing';

export default test.describe.parallel('Column context menu', () => {
  test('should realign when current active menu is hidden', async ({
    page,

    headerModel,
  }) => {
    await page.waitForInfinite();

    await headerModel.openColumnMenu('currency');

    const menu = headerModel.getColumnMenuLocator();

    let box = await menu.first().boundingBox();

    const initialX = box?.x || 0;

    // click the columns
    await headerModel.clickColumnMenuItem('currency', 'columns', {
      skipOpen: true,
    });

    // uncheck the currency column, which is 140px in width
    await headerModel.clickColumnMenuItem('currency', 'currency', {
      skipOpen: true,
      selector: 'input',
    });

    box = await menu.first().boundingBox();

    expect(box?.x).toBe(initialX - 140);
  });

  test('should realign when another column is hidden', async ({
    page,

    headerModel,
  }) => {
    await page.waitForInfinite();

    await headerModel.openColumnMenu('currency');

    const menu = headerModel.getColumnMenuLocator();

    let box = await menu.first().boundingBox();

    const initialX = box?.x || 0;

    // click the columns
    await headerModel.clickColumnMenuItem('currency', 'columns', {
      skipOpen: true,
    });

    // uncheck the country column, which is 500px in width
    await headerModel.clickColumnMenuItem('currency', 'country', {
      skipOpen: true,
      selector: 'input',
    });

    box = await menu.first().boundingBox();

    expect(box?.x).toBe(initialX - 500);
  });
});
