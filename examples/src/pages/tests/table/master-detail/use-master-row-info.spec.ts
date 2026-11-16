import { test, expect } from '@testing';

export default test.describe.parallel('Master-detail', () => {
  test('should correctly render child row and useMasterRowInfo should work', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();

    // the master and the detail rows come from the data server: wait for
    // them to arrive, rather than for a fixed time
    const firstChildColumn = tableModel.withColumn('firstNameChildColumn');
    await expect
      .poll(() => firstChildColumn.getHeader())
      .toBe('firstNameChildColumn 13');

    const idCol = tableModel.withColumn('id');
    await expect.poll(() => idCol.getHeader()).toBe('id 100');

    const firstNameInputs = page.locator('input[name="first name"]');
    await expect
      .poll(() =>
        firstNameInputs.evaluateAll((nodes) => {
          return (nodes as HTMLInputElement[]).map((node) => node.value);
        }),
      )
      .toEqual(['Axel', 'Gonzalo']);
  });
});
