import {
  getActiveCellIndicatorOffsetFromDOM,
  getCellNodeLocator,
} from '@examples/pages/tests/testUtils';
import { test, expect } from '@testing';

export default test.describe.parallel('Default keyboard navigation', () => {
  test('works correctly', async ({ page }) => {
    await page.waitForInfinite();

    const cell = getCellNodeLocator(
      {
        rowIndex: 5,
        colIndex: 4,
      },
      { page },
    );

    await cell.click();

    const offset = await getActiveCellIndicatorOffsetFromDOM({ page });

    const ROW_HEIGHT = 40;
    const ROW_INDEX = 5;

    // 800 to the left (4 columns)
    // 200 vertical offset, since the row 80 is selected, so 5* rowheight40 = 200
    expect(offset).toEqual(['800px', ROW_HEIGHT * ROW_INDEX + 'px']);
  });
});
