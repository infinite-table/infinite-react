import { columns } from '../columns';
import { getHeaderColumnIds } from '../../../../testUtils';
import { test, expect } from '@playwright/test';
export default test.describe.parallel(
  'Column visibility uncontrolled without any default value',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `tests/table/props/column-visibility/uncontrolled-without-value`,
      );
    });

    test('should display all cols', async ({ page }) => {
      await page.waitForTimeout(20);
      const colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(Array.from(columns.keys()));
    });
  },
);
