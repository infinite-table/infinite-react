import { test, expect } from '@testing';

export default test.describe.parallel('Agg Reducers are applied', () => {
  test('even when the column is grouped by', async ({ page, tableModel }) => {
    await page.waitForInfinite();
    const dep = tableModel.withColumn('department');
    const team = tableModel.withColumn('team');

    expect(await (await dep.getValues()).slice(0, 2)).toEqual(['1', '1']);
    expect(await (await team.getValues()).slice(0, 2)).toEqual(['2', '1']);
  });
});
