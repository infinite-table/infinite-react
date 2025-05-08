import { getRowCount } from '@examples/pages/tests/testUtils';
import { test, expect } from '@testing';

import developers100 from '../../data/developers100';

export default test.describe.parallel('Client side filtering', () => {
  test('Filters correctly', async ({ page }) => {
    await page.waitForInfinite();

    const goLang = developers100.filter(
      (data) => data.preferredLanguage === 'Go',
    );
    expect(await getRowCount({ page })).toEqual(goLang.length);
  });
});
