import { test, expect } from '@testing';

export default test.describe
  .parallel('Uncontrolled Multi Row Selection with checkbox', () => {
  test('should be able to use shift key to select more records', async ({
    page,

    columnModel,
  }) => {
    await page.waitForInfinite();

    const first = columnModel.getCellLocator({
      rowIndex: 0,
      colIndex: 0,
    });

    const language = columnModel.getCellLocator({
      rowIndex: 0,
      colId: 'preferredLanguage',
    });

    const c1 = await first.locator('input[type="checkbox"]');
    const l1 = await language.locator('input[type="checkbox"]');

    expect(await c1.count()).toBe(1);
    expect(await l1.count()).toBe(1);
  });
});
