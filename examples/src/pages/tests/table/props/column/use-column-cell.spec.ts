import { test, expect } from '@testing';

export default test.describe.parallel('column.components', () => {
  test('is working', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    const usa = await rowModel.getTextForCell({
      colId: 'country',
      rowIndex: 0,
    });

    expect(usa).toEqual('START:Country: USA!END');
  });
});
