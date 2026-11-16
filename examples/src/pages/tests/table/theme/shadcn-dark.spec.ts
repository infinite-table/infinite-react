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
 * What the browser computes for CSS values, on the grid of a section: the
 * color of a color value, and the width and color of a border value.
 *
 * A production build can write the same color in another way (`#eeeeee` as
 * `#eee`), so colors that come from the stylesheets are compared like this,
 * not as text.
 */
async function compute(
  page: Page,
  section: Section,
  values: { colors?: string[]; borders?: string[] },
) {
  return await page.evaluate(
    ({ section, values }) => {
      const grid = document.querySelector(
        `[data-name="${section}"] .InfiniteHeader`,
      )!;
      const probe = document.createElement('div');
      grid.appendChild(probe);

      const colors = (values.colors ?? []).map((value) => {
        probe.style.color = '';
        probe.style.color = value;
        return getComputedStyle(probe).color;
      });
      const borders = (values.borders ?? []).map((value) => {
        probe.style.border = '';
        probe.style.border = value;
        const { borderTopWidth, borderTopColor } = getComputedStyle(probe);
        return { width: borderTopWidth, color: borderTopColor };
      });
      probe.remove();

      return { colors, borders };
    },
    { section, values },
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
    const { colors } = await compute(page, 'light', {
      colors: [
        'var(--infinite-cell-border-color)',
        'var(--infinite-row-disabled-background)',
        'var(--infinite-row-odd-disabled-background)',
        'var(--infinite-rowdetail-background)',
      ],
    });
    expect(colors).toEqual([
      'rgb(198, 198, 198)',
      'rgb(238, 238, 238)',
      'rgb(249, 249, 249)',
      'rgb(219, 219, 219)',
    ]);
    expect(light['--infinite-pinned-cell-border']).toEqual('1px solid #c6c6c6');
    expect(light['--infinite-filter-editor-border']).toEqual(
      '1px solid #c6c6c6',
    );
  });

  test('uses the --primary color of the page where the default theme uses its accent', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const PRIMARY = 'var(--primary)';

    for (const section of ['light', 'dark'] as const) {
      const { colors, borders } = await compute(page, section, {
        colors: [
          PRIMARY,
          'var(--infinite-accent-color)',
          'var(--infinite-expand-collapse-icon-color)',
          'var(--infinite-filter-editor-focus-border-color)',
          // the fill of the selected cells is the accent, made transparent
          `color-mix(in srgb, ${PRIMARY}, transparent 90%)`,
          'var(--infinite-selected-cell-background-default)',
        ],
        borders: [
          'var(--infinite-focus-outline)',
          'var(--infinite-grouping-toolbar-item-active-border)',
        ],
      });

      const [
        primary,
        accent,
        expandIcon,
        filterFocusBorder,
        transparentPrimary,
        selectedCellBackground,
      ] = colors;

      expect(accent, section).toEqual(primary);
      expect(expandIcon, section).toEqual(primary);
      expect(filterFocusBorder, section).toEqual(primary);
      expect(selectedCellBackground, section).toEqual(transparentPrimary);

      expect(borders[0], section).toEqual({ width: '2px', color: primary });
      expect(borders[1], section).toEqual({ width: '1px', color: primary });
    }
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
