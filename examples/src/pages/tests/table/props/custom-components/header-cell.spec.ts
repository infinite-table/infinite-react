import { test, expect } from '@testing';

import {
  getLocatorComputedStylePropertyValue,
  toRGBString,
} from '../../../testUtils';

export default test.describe.parallel('Custom Header component', () => {
  test('is correctly applied', async ({ page, headerModel }) => {
    await page.waitForInfinite();

    const locator = headerModel.getHeaderCellLocator({
      colId: 'firstName',
    });

    const bg = await getLocatorComputedStylePropertyValue({
      handle: locator,
      page,
      propertyName: 'background-color',
    });
    expect(toRGBString(bg)).toEqual('rgb(255, 0, 0)');
  });
});
