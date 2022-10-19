import { test, expect } from '@testing';

export default test.describe.parallel(
  'Pivoting and inheriting column configuration.',
  () => {
    test('should have the column correctly inherited', async ({
      page,
      columnModel,
    }) => {
      await page.waitForInfinite();

      const color = await columnModel.getCellComputedStyleProperty(
        { colId: 'salary', rowIndex: 0 },
        'color',
      );

      expect(color).toEqual('rgb(255, 0, 0)');

      await page.click('button');

      expect(
        await columnModel.getCellComputedStyleProperty(
          { colId: 'salary:India', rowIndex: 0 },

          'color',
        ),
      ).toEqual('rgb(255, 0, 0)');
    });
  },
);
