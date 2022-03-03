import { getHeaderCellWidthByColumnId } from '../../../testUtils';

export default describe('Column types tests', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-sizing/column-default-min-width`,
    );
  });
  beforeEach(async () => {
    await page.reload();
    await page.waitForSelector('[data-column-id]');
  });

  it('expect column widths to be set correctly', async () => {
    const idSize = await getHeaderCellWidthByColumnId('id');
    const ageSize = await getHeaderCellWidthByColumnId('age');
    const countrySize = await getHeaderCellWidthByColumnId('country');
    const citySize = await getHeaderCellWidthByColumnId('city');
    const salarySize = await getHeaderCellWidthByColumnId('salary');
    const firstNameSize = await getHeaderCellWidthByColumnId('firstName');

    expect(idSize).toEqual(500);
    expect(ageSize).toEqual(1000);
    expect(countrySize).toEqual(450);
    expect(citySize).toEqual(234);
    expect(salarySize).toEqual(145);
    expect(firstNameSize).toEqual(777);
  });
});
