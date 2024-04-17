import { test, expect } from '@testing';

export default test.describe.parallel('Sortable=true', () => {
  test('should sort when draggableColumns is set to false', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();

    const firstNameCol = tableModel.withColumn('firstName');

    expect(await firstNameCol.getValues()).toEqual(['Bob', 'Alice', 'Bill']);

    await firstNameCol.clickToSort();

    expect(await firstNameCol.getValues()).toEqual(['Alice', 'Bill', 'Bob']);
  });
});
