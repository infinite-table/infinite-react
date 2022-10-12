import { test, expect, Page } from '@testing';
import { getFnCalls } from '../../../../testUtils/getFnCalls';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('onSortInfoChange', { page });
}

export default test.describe.parallel(
  'hooks.useProperty - controlled sortInfo',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.load();
    });

    test('should work correctly for controlled - outside changes should not trigger onSortInfoChange', async ({
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

    test('should work correctly for controlled - inner changes should trigger onSortInfoChange', async ({
      page,
    }) => {
      let calls = await getCalls({ page });

      expect(calls.length).toEqual(0);

      await page.click('#inner');

      calls = await getCalls({ page });
      expect(calls.length).toEqual(1);
      expect(calls[0].args).toEqual([[{ dir: -1, field: 'age' }]]);

      await page.click('#inner');

      calls = await getCalls({ page });
      expect(calls.length).toEqual(2);
      expect(calls[1].args).toEqual([[{ dir: 1, field: 'age' }]]);
    });
  },
);
