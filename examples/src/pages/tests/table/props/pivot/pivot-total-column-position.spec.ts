import { test, expect } from '@testing';

// TODO column group tests need to be improved, as not maintainable

export default test.describe.parallel('Pivot', () => {
  test('totals columns not needed when pivotBy.length < 2', async ({
    page,
    columnModel,
  }) => {
    await page.waitForInfinite(50);

    let columnIds = await columnModel.getVisibleColumnIds();
    let columnGroupIds = await columnModel.getVisibleColumnGroupIds();

    const expectedColumnIds = [
      'group-by-country',
      'salary:backend',
      'age:backend',

      'salary:frontend',
      'age:frontend',

      'total:salary',
      'total:age',
    ];
    const BACKEND = 'backend,salary:backend,age:backend';
    const FRONTEND = 'frontend,salary:frontend,age:frontend';
    const expectedGroupIds = [BACKEND, FRONTEND];

    expect(columnIds).toEqual(expectedColumnIds);
    expect(columnGroupIds).toEqual(expectedGroupIds);

    // toggles show totals to true
    await page.click('button[data-name="toggle-show-totals"]');

    await page.waitForTimeout(30);

    columnIds = await columnModel.getVisibleColumnIds();
    columnGroupIds = await columnModel.getVisibleColumnGroupIds();

    // show totals true in this case should only grand total columns be visible but not normal total columns
    // as show totals will cause totals columns be visible only when pivotBy.length > 1
    expect(columnIds).toEqual(expectedColumnIds);
    expect(columnGroupIds).toEqual(expectedGroupIds);
  });

  test('totals columns are displayed correctly when pivotBy.length > 1', async ({
    page,
    columnModel,
  }) => {
    await page.waitForInfinite(20);
    let columnIds = await columnModel.getVisibleColumnIds();
    let columnGroupIds = await columnModel.getVisibleColumnGroupIds();

    expect(columnIds).toEqual([
      'group-by-country',
      'salary:backend',
      'age:backend',
      'salary:frontend',
      'age:frontend',
      'total:salary',
      'total:age',
    ]);
    const expectedGroupIds = [
      'backend,salary:backend,age:backend',
      'frontend,salary:frontend,age:frontend',
    ];
    expect(columnGroupIds).toEqual(expectedGroupIds);

    // toggles pivot for "canDesign" field
    await page.click('button[data-name="toggle-can-design"]');
    await page.waitForTimeout(30);

    columnIds = await columnModel.getVisibleColumnIds();
    columnGroupIds = await columnModel.getVisibleColumnGroupIds();

    expect(columnIds).toEqual([
      'group-by-country',
      'salary:backend/yes',
      'age:backend/yes',
      'salary:frontend/no',
      'age:frontend/no',
      'total:salary',
      'total:age',
    ]);

    expect(columnGroupIds).toEqual([
      'backend,salary:backend/yes,age:backend/yes',
      'backend/yes,salary:backend/yes,age:backend/yes',
      'frontend,salary:frontend/no,age:frontend/no',
      'frontend/no,salary:frontend/no,age:frontend/no',
    ]);

    // toggles show totals to true
    await page.click('button[data-name="toggle-show-totals"]');

    await page.waitForTimeout(100);
    columnIds = await columnModel.getVisibleColumnIds();
    columnGroupIds = await columnModel.getVisibleColumnGroupIds();

    expect(columnIds).toEqual([
      'group-by-country',
      'salary:backend/yes',
      'age:backend/yes',
      'total:salary:backend',
      'total:age:backend',
      'salary:frontend/no',
      'age:frontend/no',
      'total:salary:frontend',
      'total:age:frontend',
      'total:salary',
      'total:age',
    ]);

    expect(columnGroupIds).toEqual([
      'backend,salary:backend/yes,age:backend/yes',
      'backend/yes,salary:backend/yes,age:backend/yes',
      'total:backend,total:salary:backend,total:age:backend',
      'frontend,salary:frontend/no,age:frontend/no',
      'frontend/no,salary:frontend/no,age:frontend/no',
      'total:frontend,total:salary:frontend,total:age:frontend',
    ]);
  });
});
