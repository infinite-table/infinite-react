import { test, expect } from '@testing';

import { columns } from '../columns';

export default test.describe.parallel(
  'Column visibility uncontrolled without any default value',
  () => {
    test('should display all columns', async ({ page, columnModel }) => {
      await page.waitForInfinite();

      const colIds = await columnModel.getVisibleColumnIds();

      expect(colIds).toEqual(Array.from(columns.keys()));
    });
  },
);
