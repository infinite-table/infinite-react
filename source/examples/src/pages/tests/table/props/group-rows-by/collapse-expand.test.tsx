// import { getCellText } from '../../../../../utils';

export default describe('Table', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/group-rows-by/collapse-expand`,
    );
    await page.waitForTimeout(10);
  });

  beforeEach(async () => {
    await page.reload();
  });
  it('cell content is there', async () => {
    // wait for rendering
    await page.waitForSelector('[data-row-index]');

    const getRowCount = async () =>
      await page.evaluate(
        () => document.querySelectorAll('[data-row-index]').length,
      );

    let count = await getRowCount();

    expect(count).toEqual(12);

    const expanderIcon = await page.$('.ITableIcon-expander--expanded');

    // collapse Cuba
    await expanderIcon!.click();

    count = await getRowCount();

    expect(count).toEqual(9);

    // expand Cuba
    await expanderIcon!.click();

    count = await getRowCount();

    expect(count).toEqual(12);
  });
});
