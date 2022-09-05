import { test, expect } from '@testing';

export default test.describe.parallel('column.components', () => {
  test('is working', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    const usa = await rowModel.getTextForCell({
      colId: 'country',
      rowIndex: 0,
    });
    const ca = await rowModel.getTextForCell({ colId: 'country', rowIndex: 2 });

    expect(usa).toEqual('Country: USA\n!Country: USA!- UNITED STATES');
    expect(ca).toEqual('Country: Canada\n!Country: Canada!- CANADA');
  });
});
