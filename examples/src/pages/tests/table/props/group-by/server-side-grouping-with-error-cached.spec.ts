import { getCellNodeLocator } from '@examples/pages/tests/testUtils';
import { test, expect } from '@testing';

export default test.describe.parallel('Server-side grouping with error', () => {
  test('should have (cached) error when appropriate ', async ({ page }) => {
    await page.waitForInfinite();

    const canadaToggleIcon = getCellNodeLocator(
      {
        columnId: 'group-by',
        rowIndex: 1,
      },
      { page },
    ).locator('svg');

    await canadaToggleIcon.click();

    const canadaCell = getCellNodeLocator(
      {
        columnId: 'group-by',
        rowIndex: 1,
      },
      { page },
    );

    expect(await canadaCell.innerText()).toEqual(
      'Cannot load children for Canada',
    );

    // we toggle it back to collapsed
    await canadaToggleIcon.click();

    // and we preserve the error since the response was cached
    expect(await canadaCell.innerText()).toEqual(
      'Cannot load children for Canada',
    );
  });
});
