import { getFnCalls } from '../../../testUtils/getFnCalls';
import { test, expect } from '@testing';

export default test.describe.parallel('Lazy Loading with eager data', () => {
  test('should correctly display eager rows', async ({
    page,
    rowModel,
    tableModel,
  }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toEqual(7);

    const col = tableModel.withColumn('group-by-stack');

    expect(await col.getValues()).toEqual([
      '',
      'frontend',
      '',
      '',
      'backend',
      'fullstack',
      '',
    ]);

    const fullStackCell = tableModel.withCell({
      colId: 'group-by-stack',
      rowIndex: 5,
    });

    let calls = await getFnCalls('dataSource', { page });
    expect(calls.length).toEqual(1);

    await fullStackCell.clickDetailIcon();

    calls = await getFnCalls('dataSource', { page });
    expect(calls.length).toEqual(2);
    expect(calls[1].args[0].groupKeys).toEqual(['USA', 'fullstack']);

    const frontendCell = tableModel.withCell({
      colId: 'group-by-stack',
      rowIndex: 1,
    });

    let rowCount = await rowModel.getRenderedRowCount();
    // collapse default expanded row
    await frontendCell.clickDetailIcon();
    calls = await getFnCalls('dataSource', { page });
    // no change here
    expect(calls.length).toEqual(2);
    let newRowCount = await rowModel.getRenderedRowCount();
    expect(newRowCount).toEqual(rowCount - 2);

    // expand frontend
    await frontendCell.clickDetailIcon();
    newRowCount = await rowModel.getRenderedRowCount();
    expect(newRowCount).toEqual(rowCount);
  });

  test('should correctly call dataSource with correct groupKeys', async ({
    page,
    rowModel,
    tableModel,
  }) => {
    await page.waitForInfinite();

    let calls = await getFnCalls('dataSource', { page });

    // expect just the initial call to have happened
    expect(calls.length).toEqual(1);

    const firstCell = tableModel.withCell({
      colIndex: 0,
      rowIndex: 0,
    });

    // collapse first row
    await firstCell.clickDetailIcon();
    expect(await rowModel.getRenderedRowCount()).toEqual(2);

    calls = await getFnCalls('dataSource', { page });
    expect(calls.length).toEqual(1);

    // expand it again
    await firstCell.clickDetailIcon();
    // collapse it again
    await firstCell.clickDetailIcon();

    calls = await getFnCalls('dataSource', { page });
    // expect no other calls, as data is cached
    expect(calls.length).toEqual(1);

    const germanyCell = tableModel.withCell({
      colIndex: 0,
      rowIndex: 1,
    });
    await germanyCell.clickDetailIcon();

    calls = await getFnCalls('dataSource', { page });
    // for Germany data is cached
    // so a new call should have been made
    expect(calls.length).toEqual(2);
    expect(calls[1].args[0].groupKeys).toEqual(['Germany']);
  });
});
