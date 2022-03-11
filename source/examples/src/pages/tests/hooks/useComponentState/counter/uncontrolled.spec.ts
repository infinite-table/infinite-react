import { getFnCalls } from '../../../testUtils/getFnCalls';

import { test, expect, Page } from '@playwright/test';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('onValueChange', { page });
}

const getValue = async ({ page }: { page: Page }) => {
  return await page.evaluate(() => document.querySelector('#value')!.innerHTML);
};

export default test.describe.parallel('hooks.use - controlled value', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/hooks/useComponentState/counter/uncontrolled`);
  });

  test('should work correctly for uncontrolled - inner changes should trigger onValueChange', async ({
    page,
  }) => {
    let calls = await getCalls({ page });

    expect(calls.length).toEqual(0);

    await page.click('#innerinc');

    calls = await getCalls({ page });
    expect(calls.length).toEqual(1);
    //@ts-ignore
    expect(calls[0].args).toEqual([11]);

    expect(await getValue({ page })).toEqual('11');

    await page.click('#innerinc');

    calls = await getCalls({ page });
    expect(calls.length).toEqual(2);
    //@ts-ignore
    expect(calls[1].args).toEqual([12]);

    expect(await getValue({ page })).toEqual('12');
  });

  test('should work correctly for uncontrolled - outside default value change should not do anything', async ({
    page,
  }) => {
    let calls = await getCalls({ page });

    await page.waitForTimeout(10);
    expect(calls.length).toEqual(0);

    await page.click('#outsideinc');

    calls = await getCalls({ page });
    expect(calls.length).toEqual(0);
    expect(await getValue({ page })).toEqual('10');

    await page.click('#outsidedec');

    calls = await getCalls({ page });
    expect(calls.length).toEqual(0);
    expect(await getValue({ page })).toEqual('10');

    await page.click('#innerinc');

    calls = await getCalls({ page });
    expect(calls.length).toEqual(1);
    //@ts-ignore
    expect(calls[0].args).toEqual([11]);

    expect(await getValue({ page })).toEqual('11');

    await page.click('#innerdec');
    await page.click('#innerdec');

    calls = await getCalls({ page });
    expect(calls.length).toEqual(3);
    //@ts-ignore
    expect(calls[2].args).toEqual([9]);

    expect(await getValue({ page })).toEqual('9');
  });
});
