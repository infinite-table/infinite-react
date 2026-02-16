import { test, expect } from '@testing';

export default test.describe.parallel('Master-detail', () => {
  test('should correctly render child row and useMasterRowInfo should work', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();

    const firstChildColumn = tableModel.withColumn('firstNameChildColumn');
    expect(await firstChildColumn.getHeader()).toBe('firstNameChildColumn 13');

    const idCol = tableModel.withColumn('id');
    expect(await idCol.getHeader()).toBe('id 100');

    const firstNameInputs = page.locator('input[name="first name"]');
    const values = await firstNameInputs.evaluateAll((nodes) => {
      return (nodes as HTMLInputElement[]).map((node) => node.value);
    });
    expect(values).toEqual(['Axel', 'Gonzalo']);
  });
});
