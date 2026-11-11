import { test, expect } from '@testing';

import { getThemeDemoInfo, setDensity } from './themeTestUtils';

export default test.describe.parallel('Terminal theme', () => {
  test('is dense, monospace, with tabular numbers', async ({ page }) => {
    await page.waitForInfinite();

    const info = await getThemeDemoInfo(page);
    expect(info.fontFamily).toContain('monospace');
    expect(info.fontSize).toBe(12);
    expect(info.rowHeight).toBe(26);
    expect(info.headerHeight).toBe(28);
    expect(info.cellFontVariantNumeric).toBe('tabular-nums');
    expect(info.headerTextTransform).toBe('uppercase');
    expect(info.cellBorderRadius).toBe('0px');
  });

  test('works with the density classNames', async ({ page }) => {
    await page.waitForInfinite();

    await setDensity(page, 'compact');
    let info = await getThemeDemoInfo(page);
    expect(info.rowHeight).toBe(21);
    expect(info.headerHeight).toBe(22);

    await setDensity(page, 'spacious');
    info = await getThemeDemoInfo(page);
    expect(info.rowHeight).toBe(31);
    expect(info.headerHeight).toBe(34);
  });

  test('has a light and a dark mode', async ({ page }) => {
    await page.waitForInfinite();

    const dark = await getThemeDemoInfo(page);
    expect(dark.background).toBe('rgb(11, 14, 19)');

    await page.click('[data-name="mode"]');
    const light = await getThemeDemoInfo(page);
    expect(light.background).toBe('rgb(251, 251, 249)');
    // same sizes in both modes
    expect(light.rowHeight).toBe(26);
  });
});
