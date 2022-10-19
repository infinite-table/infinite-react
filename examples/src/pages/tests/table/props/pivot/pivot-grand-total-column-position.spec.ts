import { test, expect } from '@testing';

import { getCellNode } from '../../../testUtils';

import { developers } from './pivot-total-column-position-data';

export default test.describe.parallel('Pivot', () => {
  test('grand totals columns are displayed in correct position', async ({
    page,
    columnModel,
  }) => {
    await page.waitForInfinite(20);
    // grand total position: false
    let columnIds = await columnModel.getVisibleColumnIds();

    expect(columnIds).toEqual([
      'group-by-country',
      'salary:backend',
      'age:backend',
      'salary:frontend',
      'age:frontend',
    ]);

    await page.click('button');

    // grand total position: end

    await page.waitForTimeout(20);

    columnIds = await columnModel.getVisibleColumnIds();

    expect(columnIds).toEqual([
      'group-by-country',
      'salary:backend',
      'age:backend',
      'salary:frontend',
      'age:frontend',
      'total:salary',
      'total:age',
    ]);

    await page.click('button');
    await page.waitForTimeout(20);

    // grand total position: start

    columnIds = await columnModel.getVisibleColumnIds();

    expect(columnIds).toEqual([
      'group-by-country',
      'total:salary',
      'total:age',
      'salary:backend',
      'age:backend',
      'salary:frontend',
      'age:frontend',
    ]);

    // now let's retrieve the value for avg age of developers in USA
    // and see if it's correct

    const node = await getCellNode(
      { columnId: 'total:age', rowIndex: 1 },
      { page },
    );

    const value = await node?.innerText();

    const matchedDevs = developers.filter((d) => d.country === 'USA');
    const expected =
      matchedDevs.reduce((acc, d) => {
        return acc + d.age;
      }, 0) / matchedDevs.length;

    expect(value).toEqual(expected + '');
  });
});
