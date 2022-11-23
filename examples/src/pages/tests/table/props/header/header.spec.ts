import { test, expect } from '@testing';

export default test.describe.parallel('Header', () => {
  test('should correctly render virtualized header', async ({
    page,
    columnModel,
  }) => {
    await page.waitForInfinite();
    let cols = await columnModel.getVisibleColumnIds();

    expect(cols).toEqual(['Id', 'FirstName', 'LastName', 'Age']);
    await page.click('button');

    cols = await columnModel.getVisibleColumnIds();

    expect(cols).toEqual([]);
  });
});
