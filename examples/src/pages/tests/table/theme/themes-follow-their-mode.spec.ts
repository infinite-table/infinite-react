import { test, expect, Page } from '@testing';

const THEMES = ['ocean', 'balsam', 'minimalist'] as const;
const MODES = ['light', 'dark'] as const;

type Section = `${(typeof THEMES)[number]}-${(typeof MODES)[number]}`;

const SECTIONS = THEMES.flatMap((theme) =>
  MODES.map((mode) => `${theme}-${mode}` as Section),
);

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
 * What the browser computes for CSS values, on the grid of a section:
 * the color of a color value and the width and color of a border value.
 * (A production build can write the same value in another way,
 * so the text of a variable is not compared.)
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

const ACCENT = 'var(--infinite-accent-color)';

export default test.describe('Themes with a mode className', () => {
  test('do not depend on the color scheme of the OS', async ({ page }) => {
    await page.waitForInfinite();

    const getAll = async () => {
      const result: Record<string, Record<string, string>> = {};
      for (const section of SECTIONS) {
        result[section] = await getThemeVars(page, section);
      }
      return result;
    };

    await page.emulateMedia({ colorScheme: 'light' });
    const osLight = await getAll();

    await page.emulateMedia({ colorScheme: 'dark' });
    const osDark = await getAll();

    expect(Object.keys(osLight['ocean-dark']).length).toBeGreaterThan(100);

    for (const section of SECTIONS) {
      expect(osDark[section], section).toEqual(osLight[section]);
    }
  });

  test('ocean uses its own accent color where the accent is used', async ({
    page,
  }) => {
    await page.waitForInfinite();

    for (const section of ['ocean-light', 'ocean-dark'] as const) {
      const { colors, borders } = await compute(page, section, {
        colors: [
          ACCENT,
          'var(--infinite-expand-collapse-icon-color)',
          'var(--infinite-filter-editor-focus-border-color)',
          'var(--infinite-resize-handle-hover-background)',
          // the fill of the active cell and of the selected cells
          // is the accent color, made transparent
          `color-mix(in srgb, ${ACCENT}, transparent 75%)`,
          'var(--infinite-active-cell-background-default)',
          'var(--infinite-selected-cell-background-default)',
        ],
        borders: [
          'var(--infinite-focus-outline)',
          'var(--infinite-grouping-toolbar-item-active-border)',
        ],
      });

      const [
        accent,
        expandIcon,
        filterFocusBorder,
        resizeHandleHover,
        transparentAccent,
        activeCellBackground,
        selectedCellBackground,
      ] = colors;

      // ocean is violet, not the blue of the default theme
      expect(accent, section).toEqual('rgb(139, 92, 246)');

      expect(expandIcon, section).toEqual(accent);
      expect(filterFocusBorder, section).toEqual(accent);
      expect(resizeHandleHover, section).toEqual(accent);
      expect(activeCellBackground, section).toEqual(transparentAccent);
      expect(selectedCellBackground, section).toEqual(transparentAccent);

      expect(borders[0], section).toEqual({ width: '2px', color: accent });
      expect(borders[1], section).toEqual({ width: '1px', color: accent });
    }
  });

  test('the themes without cell borders keep the other borders', async ({
    page,
  }) => {
    await page.waitForInfinite();

    // ocean and minimalist set the width of the cell border to 0, which
    // must not remove the borders that are made from the cell border
    const expectedColor = {
      light: { cell: 'rgb(198, 198, 198)', filterEditor: 'rgb(198, 198, 198)' },
      dark: { cell: 'rgb(42, 50, 61)', filterEditor: 'rgb(100, 100, 100)' },
    };

    for (const theme of ['ocean', 'minimalist'] as const) {
      for (const mode of MODES) {
        const section: Section = `${theme}-${mode}`;
        const { borders } = await compute(page, section, {
          borders: [
            'var(--infinite-pinned-cell-border)',
            'var(--infinite-filter-editor-border)',
          ],
        });

        expect(borders, section).toEqual([
          { width: '1px', color: expectedColor[mode].cell },
          { width: '1px', color: expectedColor[mode].filterEditor },
        ]);
      }
    }
  });

  test('in dark mode, what is made from the background uses the dark background', async ({
    page,
  }) => {
    await page.waitForInfinite();

    for (const theme of THEMES) {
      const section: Section = `${theme}-dark`;
      const { colors } = await compute(page, section, {
        colors: [
          'var(--infinite-background)',
          'var(--infinite-grouping-toolbar-item-background)',
          'var(--infinite-grouping-toolbar-reject-background)',
        ],
      });

      const [background, toolbarItem, toolbarReject] = colors;

      expect(toolbarItem, section).toEqual(background);
      expect(toolbarReject, section).toEqual(background);
    }
  });
});
