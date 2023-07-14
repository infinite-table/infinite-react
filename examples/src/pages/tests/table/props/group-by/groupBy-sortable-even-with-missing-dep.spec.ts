import { test, expect } from '@testing';

export default test.describe.parallel('Group column', () => {
  test('sortType as fn should work', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const col = tableModel.withColumn('group-test');

    const notSortedOrder = [
      'backend',
      '8',
      'john',
      '102',
      'marrie',
      'espania',
      '20',
      'roberta',
      'frontend',
      '20',
      'bill',
      '102',
      'bob',
      '15',
      'marrio',
    ];
    const ascOrder = [
      'backend',
      '8',
      'john',
      '20',
      'roberta',
      '102',
      'marrie',
      'espania',

      'frontend',
      '15',
      'marrio',
      '20',
      'bill',
      '102',
      'bob',
    ];
    const descOrder = [
      'frontend',
      '102',
      'bob',
      '20',
      'bill',
      '15',
      'marrio',

      'backend',

      '102',
      'marrie',
      'espania',
      '20',
      'roberta',
      '8',
      'john',
    ];

    expect(await col.getValues()).toEqual(notSortedOrder);

    await col.clickToSort();
    expect(await col.getValues()).toEqual(ascOrder);

    await col.clickToSort();
    expect(await col.getValues()).toEqual(descOrder);

    await col.clickToSort();
    expect(await col.getValues()).toEqual(notSortedOrder);
  });
});
