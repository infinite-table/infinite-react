import { getFnCalls } from '../../../testUtils/getFnCalls';

import { test, expect, Page } from '@playwright/test';

function getCalls({ page }: { page: Page }) {
  return getFnCalls('onLoadingChange', { page });
}

export default test.describe.parallel(
  'hooks.useProperty - controlled boolean',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`tests/hooks/useComponentState/loader/controlled-loading
    `);
    });

    test('should work correctly for controlled - outside changes should not trigger onLoadingChange', async ({
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

    test('should work correctly for controlled - inner changes should trigger onLoadingChange', async ({
      page,
    }) => {
      let calls = await getCalls({ page });

      expect(calls.length).toEqual(0);

      await page.click('#inner');

      calls = await getCalls({ page });
      expect(calls.length).toEqual(1);
      //@ts-ignore
      expect(calls[0].args).toEqual([true]);

      await page.click('#inner');

      calls = await getCalls({ page });
      expect(calls.length).toEqual(2);
      //@ts-ignore
      expect(calls[1].args).toEqual([false]);
    });
  },
);
