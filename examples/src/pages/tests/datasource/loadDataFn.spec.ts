import { test, expect, Page } from '@testing';
import { getFnCalls } from '../testUtils/getFnCalls';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('dataFn', { page });
}

export default test.describe.parallel('DataSource data fn', () => {
  test('should work correctly', async ({ page }) => {
    await page.load();

    expect((await getCalls({ page })).length).toBe(1);
  });
});
