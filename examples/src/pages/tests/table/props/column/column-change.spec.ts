import { test, expect } from '@testing';

export default test.describe.parallel('Column change', () => {
  test('works correctly', async ({
    page,
    columnModel,
    rowModel,
    headerModel,
    tracingModel,
  }) => {
    await page.waitForInfinite();
    await page.waitForTimeout(20);

    const stop = await tracingModel.start();
    let widths = (
      await columnModel.getColumnWidths(['firstName', 'salary', 'stack'])
    ).list;

    let headerText = await headerModel.getTextForHeaderCell({
      colId: 'firstName',
    });
    let cellText = await rowModel.getTextForCell({
      colId: 'firstName',
      rowIndex: 0,
    });

    expect(widths).toEqual([200, 100, 100]);
    expect(headerText).toEqual('firstName');
    expect(cellText).not.toContain('!!!');

    await page.click('button');

    widths = (
      await columnModel.getColumnWidths(['firstName', 'salary', 'stack'])
    ).list;

    headerText = await headerModel.getTextForHeaderCell('firstName');

    cellText = await rowModel.getTextForCell({
      colId: 'firstName',
      rowIndex: 0,
    });

    expect(widths).toEqual([500, 100, 100]);
    expect(headerText).toEqual('lastName');
    expect(cellText).toContain('!!!');

    await stop();
  });
});
