import { test, expect } from '@testing';

export default test.describe.parallel('Custom sort icon', () => {
  test('should render it correctly from the renderBag', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();

    const col = tableModel.withColumn('firstName');

    const headerCell = await col.getHeader();

    expect(headerCell).toEqual(['First Name', 'hey'].join('\n'));
  });
});
