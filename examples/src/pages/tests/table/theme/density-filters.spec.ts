import { test, expect, Page } from '@testing';

async function getSpacing(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector(
      '.InfiniteHeaderCell[data-column-id="department"]',
    )!;
    const operator = header.querySelector('[data-name="filter-operator"]')!;
    const editor = header.querySelector('input')!;
    const toolbarItem = document.querySelector(
      '[data-drag-item-list-id="grouping-toolbar"]',
    );
    const px = (value: string) => parseFloat(value);
    const op = getComputedStyle(operator);
    const ed = getComputedStyle(editor);
    return {
      operatorInline: px(op.paddingLeft),
      editorInline: px(ed.paddingLeft),
      toolbarItemPadding: toolbarItem
        ? px(getComputedStyle(toolbarItem).paddingTop)
        : null,
    };
  });
}

export default test.describe.parallel('Density - header filters', () => {
  test('the filter editor spacing is scaled by the density', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const comfortable = await getSpacing(page);
    expect(comfortable.operatorInline).toBe(2);
    expect(comfortable.editorInline).toBe(4);

    await page.click('[data-name="compact"]');
    const compact = await getSpacing(page);
    expect(compact.operatorInline).toBeCloseTo(1.6, 1);
    expect(compact.editorInline).toBeCloseTo(3.2, 1);

    await page.click('[data-name="spacious"]');
    const spacious = await getSpacing(page);
    expect(spacious.editorInline).toBeCloseTo(4.8, 1);
  });

  test('the grouping toolbar item padding is scaled by the density', async ({
    page,
  }, testInfo) => {
    // the grouping toolbar is React only
    test.skip(testInfo.project.name === 'vue');
    await page.waitForInfinite();

    expect((await getSpacing(page)).toolbarItemPadding).toBe(4);

    await page.click('[data-name="spacious"]');
    expect((await getSpacing(page)).toolbarItemPadding).toBeCloseTo(4.8, 1);
  });
});
