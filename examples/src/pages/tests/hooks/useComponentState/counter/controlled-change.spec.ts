import { test, expect, Page } from '@testing';

import { getFnCalls } from '../../../testUtils/getFnCalls';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('onValueChange', { page });
}

const getValue = async ({ page }: { page: Page }) => {
  return await page.evaluate(() => document.querySelector('#value')!.innerHTML);
};

export default test.describe.parallel('hooks.use - controlled sortInfo', () => {
  test.beforeEach(async ({ page }) => {
    await page.load();
  });

  test('should work correctly for controlled - outside changes should not trigger onValueChange', async ({
    page,
  }) => {
    let calls = await getCalls({ page });
    expect(calls.length).toEqual(0);

    await page.click('#outsideinc');
    calls = await getCalls({ page });
    expect(calls.length).toEqual(0);
    expect(await getValue({ page })).toEqual('11');

    await page.click('#outsideinc');

    calls = await getCalls({ page });
    expect(calls.length).toEqual(0);
    expect(await getValue({ page })).toEqual('12');

    await page.click('#outsidedec');

    calls = await getCalls({ page });
    expect(calls.length).toEqual(0);
    expect(await getValue({ page })).toEqual('11');
  });

  test('should work correctly for controlled - inner changes should trigger onValueChange', async ({
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
});
