import { test, expect } from '@testing';

export default test.describe.parallel('Api', () => {
  test('insert data', async ({
    page,
    rowModel,
    tableModel,
    apiModel,
    tracingModel,
  }) => {
    await page.waitForInfinite();

    const stop = await tracingModel.start();

    expect(await rowModel.getRenderedRowCount()).toEqual(8);

    await apiModel.evaluateDataSource((ds) => {
      ds.insertDataArray(
        [
          {
            id: 9,
            make: 'test',
            model: 'test',
            category: 'test',
            year: 2024,
            sales: 1,
            color: 'test',
          },
          {
            id: 10,
            make: 'test',
            model: 'test',
            category: 'test',
            year: 2024,
            sales: 1,
            color: 'test',
          },
        ],
        {
          position: 'after',
          primaryKey: 0,
        },
      );
    });

    expect(await rowModel.getRenderedRowCount()).toEqual(10);

    const idCol = tableModel.withColumn('id');

    expect(await idCol.getValues()).toEqual(
      [0, 9, 10, 1, 2, 3, 4, 5, 6, 7].map(String),
    );

    await stop();
  });
});
