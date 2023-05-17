import { test, expect } from '@testing';

export default test.describe.parallel('controlled columnSizing', () => {
  test('columnSizing.minWidth is kept on resize', async ({
    page,
    columnModel,
  }) => {
    await page.waitForInfinite();

    let sizes = await columnModel.getColumnWidths([
      'id',
      'country',
      'city',
      'firstName',
      'lastName',
    ]);
    expect(sizes.list).toEqual([400, 100, 200, 100, 100]);
  });
});
