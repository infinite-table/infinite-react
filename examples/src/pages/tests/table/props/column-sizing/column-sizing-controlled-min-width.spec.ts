import {
  getColumnWidths,
  resizeColumnById,
} from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('controlled columnSizing', () => {
  test('columnSizing.minWidth is kept on resize', async ({ page }) => {
    await page.waitForInfinite();

    let sizes = await getColumnWidths(['city'], {
      page,
    });

    await resizeColumnById('city', -10, { page });
    let newSizes = await getColumnWidths(['city'], {
      page,
    });

    expect(newSizes[0]).toEqual(sizes[0] - 10);

    // now make it as small as possible
    await resizeColumnById('city', -1000, { page });

    newSizes = await getColumnWidths(['city'], {
      page,
    });

    // expect the size to be the initial minWidth from columnSizing
    expect(newSizes[0]).toEqual(300);
  });
});
