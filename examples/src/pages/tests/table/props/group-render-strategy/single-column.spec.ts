import { test, expect } from '@testing';
import {
  getCellNodeLocator,
  getComputedStyleProperty,
  getFirstChild,
} from '@examples/pages/tests/testUtils';

export default test.describe.parallel(
  'Group render strategy: Single Column',
  () => {
    test('Nested group padding is there', async ({ page }) => {
      await page.waitForInfinite();

      let groupCellNode = getFirstChild(
        getFirstChild(
          getCellNodeLocator({ colId: 'group-by', rowIndex: 0 }, { page }),
        ),
      );

      let groupCellNodeElemHandle = await groupCellNode.elementHandle();
      let paddingLeft = await getComputedStyleProperty(
        groupCellNodeElemHandle!,
        'paddingLeft',
        { page },
      );

      expect(paddingLeft).toEqual('0px');

      // first nesting
      groupCellNode = getFirstChild(
        getFirstChild(
          getCellNodeLocator({ colId: 'group-by', rowIndex: 1 }, { page }),
        ),
      );

      groupCellNodeElemHandle = await groupCellNode.elementHandle();
      paddingLeft = await getComputedStyleProperty(
        groupCellNodeElemHandle!,
        'paddingLeft',
        { page },
      );

      expect(paddingLeft).toEqual('30px');

      // second nesting
      groupCellNode = getFirstChild(
        getFirstChild(
          getCellNodeLocator({ colId: 'group-by', rowIndex: 2 }, { page }),
        ),
      );

      groupCellNodeElemHandle = await groupCellNode.elementHandle();
      paddingLeft = await getComputedStyleProperty(
        groupCellNodeElemHandle!,
        'paddingLeft',
        { page },
      );

      expect(paddingLeft).toEqual('60px');
    });
  },
);
