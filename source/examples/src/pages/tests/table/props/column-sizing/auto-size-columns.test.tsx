import { getColumnWidths } from '../../../testUtils';

export default describe('Column autosizing tests', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-sizing/auto-size-columns`,
    );
  });
  beforeEach(async () => {
    await page.reload();
    await page.waitForSelector('[data-column-id]');
  });

  it('expect autoSizeColumnsKey.columnsToResize to work', async () => {
    let widths = await getColumnWidths(['id', 'country', 'city', 'age']);

    expect(widths).toEqual([200, 300, 200, 800]);

    await page.evaluate(() => {
      (window as any).autoSize = {
        columnsToResize: ['id', 'country', 'city'],
        key: Date.now(),
      };
    });

    await page.click('button');

    await page.waitForTimeout(20);

    widths = await getColumnWidths(['id', 'country', 'city', 'age']);

    expect(widths).toEqual([67, 127, 188, 800]);
  });

  it('expect autoSizeColumnsKey.columnsToSkip to work', async () => {
    let widths = await getColumnWidths(['id', 'country', 'city', 'age']);

    expect(widths).toEqual([200, 300, 200, 800]);

    await page.evaluate(() => {
      (window as any).autoSize = {
        columnsToSkip: ['id'],
        key: Date.now(),
        includeHeader: false,
      };
    });

    await page.click('button');

    await page.waitForTimeout(20);

    widths = await getColumnWidths(['id', 'country', 'city', 'age']);

    expect(widths).toEqual([200, 127, 188, 50]);
  });

  it('expect autoSizeColumnsKey to work', async () => {
    let widths = await getColumnWidths(['id', 'country', 'city', 'age']);

    expect(widths).toEqual([200, 300, 200, 800]);

    await page.evaluate(() => {
      (window as any).autoSize = Date.now();
    });

    await page.click('button');

    await page.waitForTimeout(20);

    widths = await getColumnWidths(['id', 'country', 'city', 'age']);

    expect(widths).toEqual([67, 127, 188, 133]);
  });
});
