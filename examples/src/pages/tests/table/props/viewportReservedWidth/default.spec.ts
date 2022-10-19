import { test, expect } from '@testing';

export default test.describe.parallel('Viewport reserved width', () => {
  test('works correctly', async ({ page, columnModel }) => {
    await page.waitForInfinite();

    let widths = (
      await columnModel.getColumnWidths([
        'index',
        'preferredLanguage',
        'salary',
        'age',
      ])
    ).list;

    expect(
      await page.evaluate(() => (window as any).viewportReservedWidth),
    ).toEqual(0);

    await columnModel.resizeColumn('index', -50);
    await columnModel.resizeColumn('preferredLanguage', -150);
    await columnModel.resizeColumn('salary', -100);

    expect(
      await page.evaluate(() => (window as any).viewportReservedWidth),
    ).toEqual(300);

    let newWidths = (
      await columnModel.getColumnWidths([
        'index',
        'preferredLanguage',
        'salary',
        'age',
      ])
    ).list;

    expect(newWidths).toEqual([
      widths[0] - 50,
      widths[1] - 150,
      widths[2] - 100,
      widths[3],
    ]);

    await page.click('button');

    expect(
      await page.evaluate(() => (window as any).viewportReservedWidth),
    ).toEqual(0);

    newWidths = (
      await columnModel.getColumnWidths([
        'index',
        'preferredLanguage',
        'salary',
        'age',
      ])
    ).list;

    expect(newWidths).toEqual(widths);
  });
});
