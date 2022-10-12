import { getFnCalls } from '../../../testUtils/getFnCalls';

import { test, expect, Page } from '@testing';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('onLoadingChange', { page });
}

export default test.describe.parallel(
  'hooks.useProperty - controlled boolean nochange',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.load();
    });

    test('should work correctly for controlled - inner changes should trigger onLoadingChange but loading will remain false', async ({
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

      // // the loading prop is never updated
      // // so onLoadingChange should be continously called with loading=true
      // // as it tries to update it
      calls = await getCalls({ page });
      expect(calls.length).toEqual(2);
      //@ts-ignore
      expect(calls[1].args).toEqual([true]);

      await page.click('#inner');

      calls = await getCalls({ page });
      expect(calls.length).toEqual(3);
      //@ts-ignore
      expect(calls[2].args).toEqual([true]);
    });
  },
);
