import { expect, test } from '@testing';

export default test.describe.parallel('CSSNumericVariableWatch', () => {
  test('basic scenario', async ({ page }) => {
    await page.load();

    let heights = await page.getGlobalValue('heights');
    expect(heights).toEqual([10]);

    await page.getByText('inc').click();
    await page.getByText('inc').click();

    // wait for raf
    await page.waitForRaf();

    heights = await page.getGlobalValue('heights');
    expect(heights).toEqual([10, 11, 12]);
  });
});
