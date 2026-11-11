import { test, expect } from '@testing';

import { getThemeDemoInfo, setDensity } from './themeTestUtils';

export default test.describe.parallel('Paper theme', () => {
  test('is airy and borderless, with rounded selection pills', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const info = await getThemeDemoInfo(page);
    expect(info.fontSize).toBe(14);
    expect(info.rowHeight).toBe(42);
    expect(info.headerHeight).toBe(40);
    expect(info.cellBorderRadius).toBe('0px');

    const pill = await page.evaluate(() => {
      const root = document.querySelector('#theme-demo .Infinite')!;
      const first = root.querySelector(
        '.InfiniteColumnCell--row-selected.InfiniteColumnCell--first',
      )!;
      const before = getComputedStyle(first, '::before');
      return {
        content: before.content,
        background: before.backgroundColor,
        radius: before.borderTopLeftRadius,
        top: before.top,
      };
    });
    expect(pill.content).toBe('""');
    expect(pill.background).not.toBe('rgba(0, 0, 0, 0)');
    expect(pill.radius).toBe('8px');
    expect(pill.top).toBe('3px');
  });

  test('has its own icons', async ({ page }) => {
    await page.waitForInfinite();

    const masks = await page.evaluate(() => {
      const root = document.querySelector('#theme-demo .Infinite')!;
      const expand = root.querySelector('[data-name="expand-collapse-icon"]')!;
      const sort = root.querySelector('.InfiniteIcon-sort--asc')!;
      const mask = (el: Element, pseudo?: string) => {
        const style = getComputedStyle(el, pseudo);
        return style.webkitMaskImage || (style as any).maskImage;
      };
      return { expand: mask(expand), sort: mask(sort, '::after') };
    });
    expect(masks.expand).toContain('data:image/svg+xml');
    expect(masks.sort).toContain('data:image/svg+xml');
  });

  test('works with the density classNames', async ({ page }) => {
    await page.waitForInfinite();

    await setDensity(page, 'compact');
    const info = await getThemeDemoInfo(page);
    expect(info.rowHeight).toBe(34);
    expect(info.headerHeight).toBe(32);
  });

  test('has a light and a dark mode', async ({ page }) => {
    await page.waitForInfinite();

    expect((await getThemeDemoInfo(page)).background).toBe(
      'rgb(255, 255, 255)',
    );
    await page.click('[data-name="mode"]');
    expect((await getThemeDemoInfo(page)).background).toBe('rgb(25, 25, 25)');
  });
});
