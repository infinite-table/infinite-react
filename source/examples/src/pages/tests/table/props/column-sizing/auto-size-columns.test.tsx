import { getColumnWidths } from '../../../testUtils';

function roundDownToTens(val: number) {
  return val - (val % 10);
}
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

    // expect(widths).toEqual([67, 127, 188, 800]);
    expect(widths.map(roundDownToTens)).toEqual([60, 120, 180, 800]);
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

    // expect(widths).toEqual([200, 127, 188, 50]);
    expect(widths.map(roundDownToTens)).toEqual([200, 120, 180, 50]);
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

    // expect(widths).toEqual([67, 127, 188, 133]);
    expect(widths.map(roundDownToTens)).toEqual([60, 120, 180, 130]);
  });
});
