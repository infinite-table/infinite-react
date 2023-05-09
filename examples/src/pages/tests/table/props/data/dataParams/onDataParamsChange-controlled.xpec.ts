import { getFnCalls } from '@examples/pages/tests/testUtils/getFnCalls';
import { test, expect, Page } from '@testing';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('onDataParamsChange', { page });
}
export default test.describe.parallel('onDataParamsChange', () => {
  test('should be called', async ({ page }) => {
    await page.waitForInfinite();

    await page.getByText('UPDATE data function').click();
    await page.getByText('UPDATE data function').click();
    await page.getByText('UPDATE data function').click();

    // await page.click('[data-name="update-data"]');
    // await page.click('[data-name="update-data"]');
    // await page.click('[data-name="update-data"]');
    // await page.click('[data-name="update-data"]');

    await page.getByText('UPDATE data function').click();
    await page.getByText('UPDATE data function').click();

    await page.getByText('UPDATE data function').click();
    await page.getByText('UPDATE data function').click();

    await page.waitForTimeout(200);

    let calls = await getCalls({ page });
    expect(calls.length).toBe(2);
    // const callCount = calls.length;

    // expect(calls[0].args[0]).toHaveProperty('filterFunction');

    // await page.click('[data-name="update-data"]');
    // await page.click('[data-name="update-data"]');

    // calls = await getCalls({ page });

    // expect(calls.length).toBe(1);
    // const callCount = calls.length;

    // expect(calls[0].args[0]).toHaveProperty('filterFunction');
  });
});
