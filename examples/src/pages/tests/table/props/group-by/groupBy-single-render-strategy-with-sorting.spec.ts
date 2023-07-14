import { test, expect } from '@testing';

export default test.describe
  .parallel('One group column, multiple groupBy', () => {
  test('should be sortable', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const col = tableModel.withColumn('test');

    const ascOrder = [
      '8',
      'backend',
      '',
      '20',
      'backend',
      '',
      'frontend',
      '',
      '25',
      'deployments',
      '',
      '102',
      'components',
      '',
      'infrastructure',
      '',
      '',
    ];
    expect(await col.getValues()).toEqual(ascOrder);

    await col.clickToSort();

    const descOrder = [
      '102',
      'infrastructure',
      '',
      '',
      'components',
      '',
      '25',
      'deployments',
      '',

      '20',
      'frontend',
      '',
      'backend',
      '',
      '8',
      'backend',
      '',
    ];
    expect(await col.getValues()).toEqual(descOrder);

    await col.clickToSort();
    await col.clickToSort();
    expect(await col.getValues()).toEqual(ascOrder);
  });
});
