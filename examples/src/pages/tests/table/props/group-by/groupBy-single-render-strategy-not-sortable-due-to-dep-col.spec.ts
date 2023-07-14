import { test, expect } from '@testing';

export default test.describe
  .parallel('One group column, multiple groupBy', () => {
  test('should be sortable', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const col = tableModel.withColumn('test');

    const notSortedOrder = [
      '8',
      'backend',
      '',
      '20',

      'frontend',
      '',
      'backend',
      '',
      '102',
      'infrastructure',
      '',
      '',
      'components',
      '',
      '25',
      'deployments',
      '',
    ];
    expect(await col.getValues()).toEqual(notSortedOrder);

    await col.clickToSort();
    expect(await col.getValues()).toEqual(notSortedOrder);
  });
});
