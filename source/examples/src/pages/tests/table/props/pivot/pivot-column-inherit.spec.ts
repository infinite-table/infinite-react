import { getCellNode, getComputedStyleProperty } from '../../../testUtils';
import { test, expect } from '@playwright/test';

export default test.describe.parallel(
  'Pivoting and inheriting column configuration.',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/tests/table/props/pivot/pivot-column-inherit`);
    });

    test('should have the column correctly inherited', async ({ page }) => {
      await page.waitForSelector('[data-row-index]');

      const node = await getCellNode(
        {
          columnId: 'salary',
          rowIndex: 0,
        },
        { page },
      );

      const color = await getComputedStyleProperty(node!, 'color', { page });
      expect(color).toEqual('rgb(255, 0, 0)');

      await page.click('button');

      expect(
        await getComputedStyleProperty(
          (await getCellNode(
            { columnId: 'salary:India', rowIndex: 0 },
            { page },
          ))!,
          'color',
          { page },
        ),
      ).toEqual('rgb(255, 0, 0)');
    });
  },
);
