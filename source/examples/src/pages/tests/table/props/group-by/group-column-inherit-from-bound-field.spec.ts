import { test, expect } from '@testing';

export default test.describe.parallel('Group column configuration', () => {
  test('inherits renderLeafValue and style', async ({
    page,

    rowModel,
  }) => {
    await page.waitForInfinite();
    const text0 = await rowModel.getTextForCell({
      rowIndex: 0,
      colIndex: 0,
    });
    const text1 = await rowModel.getTextForCell({
      rowIndex: 1,
      colIndex: 0,
    });
    const text2 = await rowModel.getTextForCell({
      rowIndex: 2,
      colIndex: 0,
    });

    expect(text0).toBe('frontend.');
    expect(text1).toBe('JavaScript?');
    expect(text2).toBe('John!');
  });

  test('styles are merged correctly', async ({ rowModel, page }) => {
    await page.waitForInfinite();
    // font size is not inherited, as it's overriden
    expect(
      await rowModel.getCellComputedStylePropertyValue(
        {
          rowIndex: 1,
          colIndex: 0,
        },
        'font-size',
      ),
    ).toBe('16px');
    expect(
      await rowModel.getCellComputedStylePropertyValue(
        {
          rowIndex: 1,
          colId: 'preferredLanguage',
        },
        'font-size',
      ),
    ).toBe('24px');

    const color1 = await rowModel.getCellComputedStylePropertyValue(
      {
        rowIndex: 1,
        colId: 'preferredLanguage',
      },
      'color',
    );

    // but color should be inherited, as it's not overriden
    expect(
      await rowModel.getCellComputedStylePropertyValue(
        {
          rowIndex: 1,
          colIndex: 0,
        },
        'color',
      ),
    ).toBe(color1);

    const color2 = await rowModel.getCellComputedStylePropertyValue(
      {
        rowIndex: 2,
        colId: 'firstName',
      },
      'color',
    );

    // color should be inherited, as it's not overriden
    expect(
      await rowModel.getCellComputedStylePropertyValue(
        {
          rowIndex: 2,
          colIndex: 0,
        },
        'color',
      ),
    ).toBe(color2);

    // but line-through should not be, as it was overriden
    expect(
      await rowModel.getCellComputedStylePropertyValue(
        {
          rowIndex: 2,
          colIndex: 0,
        },
        'text-decoration',
      ),
    ).toContain('line-through');
  });
});
