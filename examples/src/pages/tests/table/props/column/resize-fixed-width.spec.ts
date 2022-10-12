import {
  getHeaderCellWidthByColumnId,
  resizeColumnById,
} from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('Column Resizing', () => {
  test('works correctly', async ({ page }) => {
    await page.waitForInfinite();

    await resizeColumnById('country', 50, { page });

    let size = await getHeaderCellWidthByColumnId('country', {
      page,
    });

    expect(size).toEqual(150);

    let resizeCalls = await page.evaluate(
      () => (window as any).onColumnSizingChange.getCalls().length,
    );

    expect(resizeCalls).toEqual(1);

    await resizeColumnById('country', 300, { page });

    resizeCalls = await page.evaluate(
      () => (window as any).onColumnSizingChange.getCalls().length,
    );
    expect(resizeCalls).toEqual(2);

    size = await getHeaderCellWidthByColumnId('country', {
      page,
    });

    expect(size).toEqual(450);

    expect(
      await page.evaluate(
        () => (window as any).onColumnSizingChange.getCalls()[1].args[0],
      ),
    ).toEqual({ country: { width: 450 } });
  });
});
