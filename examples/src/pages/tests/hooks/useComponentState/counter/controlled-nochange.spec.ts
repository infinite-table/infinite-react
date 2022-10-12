import { getFnCalls } from '../../../testUtils/getFnCalls';
import { test, expect, Page } from '@playwright/test';

function getCalls({ page }: { page: Page }) {
  return getFnCalls('onValueChange', { page });
}

const getValue = async ({ page }: { page: Page }) => {
  return await page.evaluate(() => document.querySelector('#value')!.innerHTML);
};

export default test.describe.parallel('hooks.use - controlled value', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `tests/hooks/useComponentState/counter/controlled-nochange`,
    );
  });

  test.skip('should work correctly for controlled - inner changes should trigger onValueChange, even if prop is not updated', async ({
    page,
  }) => {
    let calls = await getCalls({ page });

    expect(calls.length).toEqual(0);

    await page.click('#innerinc');

    calls = await getCalls({ page });
    expect(calls.length).toEqual(1);
    //@ts-ignore
    expect(calls[0].args).toEqual([11]);
    // controlled prop is not updated, so actual value wont change
    expect(await getValue({ page })).toEqual('10');

    await page.click('#innerinc');

    calls = await getCalls({ page });
    expect(calls.length).toEqual(2);
    //@ts-ignore
    expect(calls[1].args).toEqual([11]);
    // controlled prop is not updated, so actual value wont change
    expect(await getValue({ page })).toEqual('10');
  });
});
