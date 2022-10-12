import { test, expect } from '@testing';

import { getHeaderCellWidthByColumnId } from '../../../testUtils';

export default test.describe.parallel('Column types tests', () => {
  test('expect column widths to be set correctly', async ({ page }) => {
    await page.load();
    const idSize = await getHeaderCellWidthByColumnId('id', { page });
    const ageSize = await getHeaderCellWidthByColumnId('age', { page });
    const countrySize = await getHeaderCellWidthByColumnId('country', { page });
    const citySize = await getHeaderCellWidthByColumnId('city', { page });
    const salarySize = await getHeaderCellWidthByColumnId('salary', { page });
    const firstNameSize = await getHeaderCellWidthByColumnId('firstName', {
      page,
    });

    expect(idSize).toEqual(500);
    expect(ageSize).toEqual(1000);
    expect(countrySize).toEqual(450);
    expect(citySize).toEqual(234);
    expect(salarySize).toEqual(145);
    expect(firstNameSize).toEqual(777);
  });
});
