import { test, expect } from '@testing';
import {
  getCellNodeLocator,
  getComputedStyleProperty,
  getFirstChild,
} from '@examples/pages/tests/testUtils';

import { data } from './pivot-grouping-example-data';

export default test.describe.parallel('Pivoting with grouping and agg', () => {
  test('should display values correctly and getCellValue should work', async ({
    page,
    apiModel,

    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colIndex: 1,
      }),
    ).toBe('MIT License');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 1,
          columnId: 'group-by-license',
        });
      }),
    ).toBe('MIT License');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 0,
          columnId: 'license:MIT License',
        });
      }),
    ).toBe(
      data.filter(
        (d) => d.license === 'MIT License' && d.language === 'JavaScript',
      ).length,
    );

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 2,
          columnId: 'license:BSD 3-Clause',
        });
      }),
    ).toBe(
      data.filter(
        (d) => d.license === 'BSD 3-Clause' && d.language === 'JavaScript',
      ).length,
    );

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 0,
          columnId: 'group-by-language',
        });
      }),
    ).toBe('JavaScript');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 1,
          columnId: 'group-by-language',
        });
      }),
    ).toBe('JavaScript');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colId: 'group-by-language',
      }),
    ).toBe('JavaScript');

    const expanderPadding = async (rowIndex: number) => {
      const node = getFirstChild(
        getFirstChild(
          getCellNodeLocator(
            { colId: 'group-by-language', rowIndex },
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

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 1,
          columnId: 'group-by-license',
        });
      }),
    ).toBe('MIT License');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colId: 'group-by-license',
      }),
    ).toBe('MIT License');
  });
});
