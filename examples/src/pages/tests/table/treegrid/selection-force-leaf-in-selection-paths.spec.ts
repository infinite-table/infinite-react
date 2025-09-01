import { test, expect } from '@testing';

export default test.describe('TreeSelectionProp', () => {
  test('when defined, makes selectionMode default to multi-row', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const headerCheckbox = await page.locator(
      '.InfiniteHeader input[type="checkbox"]',
    );
    expect(
      await headerCheckbox?.evaluate((el) => {
        return {
          checked: (el as HTMLInputElement).checked,
          indeterminate: (el as HTMLInputElement).indeterminate,
        };
      }),
    ).toEqual({ checked: false, indeterminate: true });

    expect(await rowModel.getSelectedRowIdsForVisibleRows()).toEqual([
      '30',
      '310',
      '3111',
    ]);

    await rowModel.clickRow(1);

    await page.keyboard.press('Space');

    expect(await rowModel.getSelectedRowIdsForVisibleRows()).toEqual([
      '1',
      '10',
      '100',
      '101',
      '102',
      '30',
      '310',
      '3111',
    ]);

    const treeSelectionState = await page.getGlobalValue('treeSelectionState');

    expect(treeSelectionState).toEqual({
      defaultSelection: false,
      selectedPaths: [
        ['1', '10', '100'],
        ['1', '10', '101'],
        ['1', '10', '102'],
        ['3', '30'],
        ['3', '31', '310'],
        ['3', '31', '311', '3111'],
      ],
    });
  });
});
