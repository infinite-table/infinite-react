import { getFnCalls } from '../../../testUtils/getFnCalls';

import { test, expect, Page } from '@playwright/test';
async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('onLoadingChange', { page });
}

export default test.describe.parallel(
  'hooks.useProperty - controlled boolean',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`tests/hooks/useComponentState/loader/uncontrolled-loading
    `);
    });

    test('should work correctly for uncontrolled - outside changes should not change state or trigger onLoadingChange', async ({
      page,
    }) => {
      let calls = await getCalls({ page });

      expect(calls.length).toEqual(0);

      await page.click('#outsidetoggle');

      calls = await getCalls({ page });
      expect(calls.length).toEqual(0);

      await page.click('#outsidetoggle');

      calls = await getCalls({ page });
      expect(calls.length).toEqual(0);
    });

    test('should work correctly for uncontrolled - inner changes should trigger onLoadingChange', async ({
      page,
    }) => {
      let calls = await getCalls({ page });
      expect(calls.length).toEqual(0);

      await page.click('#inner');

      calls = await getCalls({ page });
      expect(calls.length).toEqual(1);
      //@ts-ignore
      expect(calls[0].args).toEqual([false]);

      await page.click('#inner');

      calls = await getCalls({ page });
      expect(calls.length).toEqual(2);
      //@ts-ignore
      expect(calls[1].args).toEqual([true]);
    });
  },
);
