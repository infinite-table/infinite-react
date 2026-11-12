import { test, expect, Page } from '@testing';

type Section = 'light' | 'dark';

/**
 * The values of all the `--infinite-*` variables that are declared
 * in the stylesheets of the page, as they are on the grid of a section.
 */
async function getThemeVars(page: Page, section: Section) {
  return await page.evaluate((section) => {
    const names = new Set<string>();

    const collect = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        const style = (rule as CSSStyleRule).style;
        if (style) {
          for (const name of Array.from(style)) {
            if (name.startsWith('--infinite-')) {
              names.add(name);
            }
          }
        }
        const nested = (rule as CSSGroupingRule).cssRules;
        if (nested) {
          collect(nested);
        }
      }
    };

    for (const sheet of Array.from(document.styleSheets)) {
      try {
        collect(sheet.cssRules);
      } catch (ex) {
        // a stylesheet we cannot read, which is not ours
      }
    }

    const grid = document.querySelector(
      `[data-name="${section}"] .InfiniteHeader`,
    )!;
    const style = getComputedStyle(grid);

    return Object.fromEntries(
      Array.from(names)
        .sort()
        .map((name) => [name, style.getPropertyValue(name).trim()]),
    );
  }, section);
}

/**
 * The color a variable gives, as the browser computes it. A production build
 * can write the same color in another way (`#eeeeee` as `#eee`), so colors
 * that come from the stylesheets are compared like this, not as text.
 */
async function getColors(page: Page, section: Section, names: string[]) {
  return await page.evaluate(
    ({ section, names }) => {
      const grid = document.querySelector(
        `[data-name="${section}"] .InfiniteHeader`,
      )!;
      const probe = document.createElement('div');
      grid.appendChild(probe);

      const colors = Object.fromEntries(
        names.map((name) => {
          probe.style.color = `var(${name})`;
          return [name, getComputedStyle(probe).color];
        }),
      );
      probe.remove();

      return colors;
    },
    { section, names },
  );
}

// the values of the shadcn/ui variables in dark mode
const DARK = {
  background: 'oklch(0.145 0 0)',
  border: 'oklch(0.269 0 0)',
  input: 'oklch(0.269 0 0)',
  muted: 'oklch(0.269 0 0)',
};

export default test.describe('shadcn theme', () => {
  test('follows the dark className of the page', async ({ page }) => {
    await page.waitForInfinite();

    const dark = await getThemeVars(page, 'dark');

    expect(dark['--infinite-theme-mode']).toEqual('dark');

    // these had the colors of the light mode of the default theme
    expect(dark['--infinite-cell-border-color']).toEqual(DARK.border);
    expect(dark['--infinite-cell-border']).toEqual(`1px solid ${DARK.border}`);
    expect(dark['--infinite-pinned-cell-border']).toEqual(
      `1px solid ${DARK.border}`,
    );
    expect(dark['--infinite-filter-editor-border']).toEqual(
      `1px solid ${DARK.input}`,
    );
    expect(dark['--infinite-rowdetail-background']).toEqual(DARK.muted);
    expect(dark['--infinite-grouping-toolbar-item-background']).toEqual(
      DARK.background,
    );
    expect(dark['--infinite-grouping-toolbar-reject-background']).toEqual(
      DARK.background,
    );

    for (const name of [
      '--infinite-row-disabled-background',
      '--infinite-row-odd-disabled-background',
      '--infinite-row-selected-disabled-background',
    ]) {
      // derived from the dark colors of the page
      expect(dark[name], name).toContain(DARK.muted);
    }
  });

  test('the light mode keeps its colors', async ({ page }) => {
    await page.waitForInfinite();

    const light = await getThemeVars(page, 'light');

    expect(light['--infinite-theme-mode']).toEqual('light');
    expect(light['--infinite-background']).toEqual('oklch(1 0 0)');

    // the light colors of the default theme
    expect(
      await getColors(page, 'light', [
        '--infinite-cell-border-color',
        '--infinite-row-disabled-background',
        '--infinite-row-odd-disabled-background',
        '--infinite-rowdetail-background',
      ]),
    ).toEqual({
      '--infinite-cell-border-color': 'rgb(198, 198, 198)',
      '--infinite-row-disabled-background': 'rgb(238, 238, 238)',
      '--infinite-row-odd-disabled-background': 'rgb(249, 249, 249)',
      '--infinite-rowdetail-background': 'rgb(219, 219, 219)',
    });
    expect(light['--infinite-pinned-cell-border']).toEqual('1px solid #c6c6c6');
    expect(light['--infinite-filter-editor-border']).toEqual(
      '1px solid #c6c6c6',
    );
  });

  test('does not depend on the color scheme of the OS', async ({ page }) => {
    await page.waitForInfinite();

    await page.emulateMedia({ colorScheme: 'light' });
    const osLight = {
      light: await getThemeVars(page, 'light'),
      dark: await getThemeVars(page, 'dark'),
    };

    await page.emulateMedia({ colorScheme: 'dark' });
    const osDark = {
      light: await getThemeVars(page, 'light'),
      dark: await getThemeVars(page, 'dark'),
    };

    expect(Object.keys(osLight.light).length).toBeGreaterThan(100);

    expect(osDark.light).toEqual(osLight.light);
    expect(osDark.dark).toEqual(osLight.dark);
  });
});
