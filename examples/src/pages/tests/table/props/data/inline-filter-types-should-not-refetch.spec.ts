import { getFnCalls } from '@examples/pages/tests/testUtils/getFnCalls';

import { test, expect } from '@testing';

export default test.describe.parallel('Inline filterTypes', () => {
  test('a new filterTypes object with the same content does not refetch', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await page.waitForTimeout(200);

    expect((await getFnCalls('dataSource', { page })).length).toEqual(1);

    await page.getByText('Rerender').click();
    await page.waitForTimeout(300);
    await page.getByText('Rerender').click();
    await page.waitForTimeout(300);

    expect((await getFnCalls('dataSource', { page })).length).toEqual(1);
  });
});
