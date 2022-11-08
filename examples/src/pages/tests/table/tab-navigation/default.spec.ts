import { test, expect, Page } from '@testing';

async function getFocusedValue(page: Page) {
  return await page.evaluate(
    () => (document.activeElement as HTMLInputElement)?.value || '',
  );
}

async function rowTab(page: Page) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(50);

  await page.keyboard.press('Tab');
  await page.waitForTimeout(50);
}

export default test.describe.parallel('Tabbbing', () => {
  test('should work fine', async ({ page }) => {
    await page.waitForInfinite();

    await page.focus('input');

    await page.keyboard.press('Tab');

    await page.evaluate(() => {
      (window as any).infiniteApi.scrollTop = 3000;
    });

    await page.waitForTimeout(50);

    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);

    let value = await getFocusedValue(page);

    expect(value).toBe('0-country');

    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);

    value = await getFocusedValue(page);
    expect(value).toBe('0-currency');

    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);

    value = await getFocusedValue(page);
    expect(value).toBe('1-country');

    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);

    value = await getFocusedValue(page);
    expect(value).toBe('1-currency');

    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);

    value = await getFocusedValue(page);
    expect(value).toBe('2-country');

    // tab through row 3
    await rowTab(page);
    // tab through row 4
    await rowTab(page);
    // tab through row 5
    await rowTab(page);
    // tab through row 6
    await rowTab(page);
    // tab through row 7
    await rowTab(page);
    // tab through row 8
    await rowTab(page);
    // tab through row 9
    await rowTab(page);

    value = await getFocusedValue(page);
    expect(value).toBe('8-country');

    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);

    value = await getFocusedValue(page);
    expect(value).toBe('8-currency');

    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);

    value = await getFocusedValue(page);
    expect(value).toBe('Patrick');
  });
});
