import { test, expect, Page } from '@playwright/test';
import { getFnCalls } from '../../../../testUtils/getFnCalls';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('onSortInfoChange', { page });
}

export default test.describe.parallel(
  'hooks.useProperty - controlled boolean nochange',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`tests/hooks/useComponentState/loader/sortInfo/controlled-sortinfo-nochange
    `);
    });

    test('should work correctly for controlled - inner changes should trigger onSortInfoChange but sortInfo will retain the initial value', async ({
      page,
    }) => {
      let calls = await getCalls({ page });

      expect(calls.length).toEqual(0);

      await page.click('#inner');

      calls = await getCalls({ page });
      expect(calls.length).toEqual(1);
      expect(calls[0].args).toEqual([[{ dir: -1, field: 'age' }]]);

      await page.click('#inner');

      // the sortInfo prop is never updated
      // so onSortInfoChange should be continously called with sortInfo=[{dir: -1, field: 'age'}]
      // as it tries to update it
      calls = await getCalls({ page });
      expect(calls.length).toEqual(2);
      expect(calls[1].args).toEqual([[{ dir: -1, field: 'age' }]]);

      await page.click('#inner');

      calls = await getCalls({ page });
      expect(calls.length).toEqual(3);
      expect(calls[2].args).toEqual([[{ dir: -1, field: 'age' }]]);
    });
  },
);
