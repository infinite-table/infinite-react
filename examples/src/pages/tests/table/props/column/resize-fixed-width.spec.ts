import { test, expect } from '@testing';

export default test.describe.parallel('Column Resizing', () => {
  test('works correctly', async ({ page, columnModel }) => {
    await page.waitForInfinite();

    await columnModel.resizeColumn({ colId: 'country' }, 50);

    let size = await columnModel.getColumnWidth('country');

    expect(size).toEqual(150);

    let resizeCalls = await page.evaluate(
      () => (window as any).onColumnSizingChange.getCalls().length,
    );

    expect(resizeCalls).toEqual(1);

    await columnModel.resizeColumn('country', 300);

    resizeCalls = await page.evaluate(
      () => (window as any).onColumnSizingChange.getCalls().length,
    );
    expect(resizeCalls).toEqual(2);

    size = await columnModel.getColumnWidth('country');

    expect(size).toEqual(450);

    expect(
      await page.evaluate(
        () => (window as any).onColumnSizingChange.getCalls()[1].args[0],
      ),
    ).toEqual({ country: { width: 450 } });
  });
});
