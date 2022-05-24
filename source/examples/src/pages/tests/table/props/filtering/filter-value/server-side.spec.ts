import {
  getRowCount,
  getValuesByColumnId,
} from '@examples/pages/tests/testUtils';
import { test, expect, Response } from '@testing';

export default test.describe.parallel('Server side filtering', () => {
  test('Filters correctly', async ({ page }) => {
    await page.waitForInfinite();

    expect(await getRowCount({ page })).toEqual(100);

    let length = 0;
    const condition = (response: Response) => {
      const ok =
        response.url().includes('developers') && response.status() === 200;

      if (ok) {
        return response.json().then((resp) => {
          length = resp.totalCount;
          return resp;
        });
      }

      return ok;
    };

    await Promise.all([
      page.waitForResponse(condition),
      page.locator('button[data-name="stack"]').click(),
    ]);

    expect(await getRowCount({ page })).toEqual(length);

    await Promise.all([
      page.waitForResponse(condition),
      page.locator('button[data-name="country"]').click(),
    ]);

    expect(await getRowCount({ page })).toEqual(length);

    const values = await getValuesByColumnId('country', { page });

    expect(values).toEqual(new Array(length).fill('United States'));
  });
});
