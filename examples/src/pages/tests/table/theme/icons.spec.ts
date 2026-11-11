import { test, expect, Page } from '@testing';

// a recognizable icon (a full square), used to override the defaults
const SQUARE_PATH = 'M0 0H24V24H0Z';
const SQUARE_ICON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='${SQUARE_PATH}'/%3E%3C/svg%3E")`;

async function getStyle(
  page: Page,
  selector: string,
  prop: string,
  pseudo?: '::after',
) {
  return page.evaluate(
    ({ selector, prop, pseudo }) => {
      const style = getComputedStyle(document.querySelector(selector)!, pseudo);
      return (
        style.getPropertyValue(prop) ||
        style.getPropertyValue(`-webkit-${prop}`)
      );
    },
    { selector, prop, pseudo },
  );
}

const EXPAND_ICON = 'svg[data-name="expand-collapse-icon"]';
const CONTAINS_OPERATOR_ICON =
  '.InfiniteHeaderCell[data-column-id="department"] [data-name="filter-operator"] svg';
const SORT_ASC_ICON =
  '.InfiniteHeaderCell[data-column-id="firstName"] .InfiniteIcon-sort';
const SORT_DESC_ICON =
  '.InfiniteHeaderCell[data-column-id="age"] .InfiniteIcon-sort';
const FILTER_ICON =
  '.InfiniteHeaderCell[data-column-id="department"] .InfiniteIcon-filter';
const MENU_ICON =
  '.InfiniteHeaderCell[data-column-id="firstName"] [data-name="menu-icon"]';

const PATH_ICONS = [EXPAND_ICON, CONTAINS_OPERATOR_ICON];
const LINE_ICONS = [SORT_ASC_ICON, SORT_DESC_ICON, FILTER_ICON, MENU_ICON];

export default test.describe.parallel('Themeable icons', () => {
  test('by default, path icons are the inline svg path, not masked', async ({
    page,
  }) => {
    await page.waitForInfinite();

    for (const selector of PATH_ICONS) {
      expect(await page.locator(`${selector} path`).count()).toBeGreaterThan(
        0,
      );
      expect(await getStyle(page, selector, 'mask-image')).toBe('none');
      // the custom icon layer is not displayed
      expect(await getStyle(page, `${selector} > rect`, 'display')).toBe(
        'none',
      );
    }
    expect(
      await page.locator(`${EXPAND_ICON} path`).first().getAttribute('d'),
    ).toContain('M8.59 16.59L13.17 12 8.59 7.41');
  });

  test('path icons can be swapped via CSS variables', async ({ page }) => {
    await page.waitForInfinite();

    const before = await page.locator(EXPAND_ICON).first().screenshot();

    await page.addStyleTag({
      content: `.Infinite {
        --infinite-icon-expand-collapse: ${SQUARE_ICON};
        --infinite-icon-filter-operator-contains: ${SQUARE_ICON};
      }`,
    });

    for (const selector of PATH_ICONS) {
      expect(await getStyle(page, selector, 'mask-image')).toContain(
        SQUARE_PATH,
      );
      expect(await getStyle(page, `${selector} > rect`, 'display')).toBe(
        'inline',
      );
    }

    // a full square, in the icon color
    const after = await page.locator(EXPAND_ICON).first().screenshot();
    expect(Buffer.compare(before, after)).not.toBe(0);

    // the other operator icons are not affected
    expect(
      await getStyle(
        page,
        '.InfiniteHeaderCell[data-column-id="age"] [data-name="filter-operator"] svg',
        'mask-image',
      ),
    ).toBe('none');
  });

  test('line icons (sort, filter, menu) are not changed by default', async ({
    page,
  }) => {
    await page.waitForInfinite();

    for (const selector of LINE_ICONS) {
      // the overlay is not rendered
      expect(await getStyle(page, selector, 'display', '::after')).toBe(
        'none',
      );
      // and the lines are not masked
      expect(
        await getStyle(page, `${selector} > div:last-child`, 'mask-image'),
      ).toBe('none');
    }
  });

  test('line icons can be swapped via CSS variables', async ({ page }) => {
    await page.waitForInfinite();

    await page.addStyleTag({
      content: `.Infinite {
        --infinite-icon-sort-asc: ${SQUARE_ICON};
        --infinite-icon-filter: ${SQUARE_ICON};
        --infinite-icon-menu: ${SQUARE_ICON};
      }`,
    });

    for (const selector of [SORT_ASC_ICON, FILTER_ICON, MENU_ICON]) {
      expect(await getStyle(page, selector, 'display', '::after')).toBe(
        'block',
      );
      expect(
        await getStyle(page, selector, 'mask-image', '::after'),
      ).toContain(SQUARE_PATH);
      // the lines are hidden, by a zero-size mask layer
      const line = `${selector} > div:last-child`;
      expect(await getStyle(page, line, 'mask-image')).toContain(SQUARE_PATH);
      expect(await getStyle(page, line, 'mask-size')).toBe('0px 0px');
    }

    // sort-desc was not specified, so it still uses the lines
    expect(await getStyle(page, SORT_DESC_ICON, 'display', '::after')).toBe(
      'none',
    );
    expect(
      await getStyle(page, `${SORT_DESC_ICON} > div:last-child`, 'mask-image'),
    ).toBe('none');
  });

  test('custom line icons are painted with the text color in forced colors mode', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.waitForInfinite();

    await page.addStyleTag({
      content: `.Infinite { --infinite-icon-sort-asc: ${SQUARE_ICON}; }`,
    });

    const canvasText = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.color = 'CanvasText';
      document.body.appendChild(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    });

    expect(
      await getStyle(page, SORT_ASC_ICON, 'forced-color-adjust', '::after'),
    ).toBe('none');
    expect(
      await getStyle(page, SORT_ASC_ICON, 'background-color', '::after'),
    ).toBe(canvasText);
  });
});
