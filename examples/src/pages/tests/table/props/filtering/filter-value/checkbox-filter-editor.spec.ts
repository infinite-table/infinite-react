import { test, expect } from '@testing';

export default test.describe
  .parallel('A checkbox as a custom filter editor', () => {
  test('starts with the empty value and shows every state it goes through', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const checkbox = headerModel
      .getHeaderCellLocator({ colId: 'canDesign' })
      .locator('[data-name="bool-filter-editor"] input[type="checkbox"]');

    const getState = () =>
      checkbox.evaluate((node) => {
        const input = node as HTMLInputElement;
        return input.indeterminate
          ? 'indeterminate'
          : input.checked
          ? 'checked'
          : 'unchecked';
      });

    // the editor starts with the filter type's empty value (null), so the
    // checkbox is indeterminate and nothing is filtered
    await expect.poll(getState).toBe('indeterminate');
    expect(await rowModel.getRenderedRowCount()).toBe(5);

    // indeterminate -> false: the editor sets false, though the click
    // would have checked the input
    await checkbox.click();
    await expect.poll(() => rowModel.getRenderedRowCount()).toBe(3);
    expect(await getState()).toBe('unchecked');

    // false -> true
    await checkbox.click();
    await expect.poll(() => rowModel.getRenderedRowCount()).toBe(2);
    expect(await getState()).toBe('checked');

    // true -> indeterminate: no filter
    await checkbox.click();
    await expect.poll(() => rowModel.getRenderedRowCount()).toBe(5);
    expect(await getState()).toBe('indeterminate');

    // and round again
    await checkbox.click();
    await expect.poll(() => rowModel.getRenderedRowCount()).toBe(3);
    expect(await getState()).toBe('unchecked');
  });
});
