import { test, expect } from '@testing';

export default test.describe.parallel('Column Menus', () => {
  test('works', async ({ page, headerModel }) => {
    await page.waitForInfinite();

    const box = page.locator(`[data-name="msg"]`);

    await headerModel.clickColumnMenuItem('firstName', 'hi');
    let msg = await box.innerText();
    expect(msg).toBe('hello firstName');

    await headerModel.clickColumnMenuItem('age', 'hi');
    msg = await box.innerText();
    expect(msg).toBe('hello age');

    await headerModel.clickColumnMenuItem('age', 'ageitem');
    msg = await box.innerText();
    expect(msg).toBe('age!');

    expect(await headerModel.hasColumnMenu('stack')).toBe(false);
    expect(await headerModel.hasColumnMenu('age')).toBe(true);
  });
});
