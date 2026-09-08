import { test, expect } from '@testing';
import {
  getCellNodeLocator,
  getComputedStyleProperty,
  getFirstChild,
} from '@examples/pages/tests/testUtils';

export default test.describe
  .parallel('Pivot single-column group render strategy', () => {
  test('leaf group rows indent one extra nesting level', async ({
    page,
    apiModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(
      await rowModel.getTextForCell({
        rowIndex: 0,
        colId: 'group-by',
      }),
    ).toBe('NA');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colId: 'group-by',
      }),
    ).toBe('Acme');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 1,
          columnId: 'group-by',
        });
      }),
    ).toBe('Acme');

    const expanderPadding = async (rowIndex: number) => {
      const node = getFirstChild(
        getFirstChild(
          getCellNodeLocator({ colId: 'group-by', rowIndex }, { page }),
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
    expect(await expanderPadding(3)).toEqual('0px');
    expect(await expanderPadding(6)).toEqual('48px');
  });
});
