import { test, expect } from '@testing';
import {
  getCellNodeLocator,
  getComputedStyleProperty,
  getFirstChild,
} from '@examples/pages/tests/testUtils';

export default test.describe
  .parallel('Pivot group column bound to the pivot field', () => {
  test('nested group rows show the bound field when it is unique in the group', async ({
    page,
    apiModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 0,
          columnId: 'group-by-region',
        });
      }),
    ).toBe('NA');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colId: 'group-by-region',
      }),
    ).toBe('SMB');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 1,
          columnId: 'group-by-region',
        });
      }),
    ).toBe('SMB');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 2,
        colId: 'group-by-region',
      }),
    ).toBe('Enterprise');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 4,
        colId: 'group-by-region',
      }),
    ).toBe('SMB');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 6,
        colId: 'group-by-region',
      }),
    ).toBe('');

    const expanderPadding = async (rowIndex: number) => {
      const node = getFirstChild(
        getFirstChild(
          getCellNodeLocator(
            { colId: 'group-by-region', rowIndex },
            { page },
          ),
        ),
      );
      return getComputedStyleProperty(
        (await node.elementHandle())!,
        'paddingLeft',
        { page },
      );
    };

    expect(await expanderPadding(0)).toEqual('0px');
    expect(await expanderPadding(1)).toEqual('48px');
  });
});
