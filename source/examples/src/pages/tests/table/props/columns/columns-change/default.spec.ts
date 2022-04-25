import { test, expect } from '@testing';

import { getHeaderColumnIds } from '../../../../testUtils';

export default test.describe.parallel('Detect columns change', () => {
  test('expect columns are correctly set when updated on useEffect', async ({
    page,
  }) => {
    await page.waitForSelector('[data-column-id]');

    const colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['identifier', 'firstName', 'age']);
  });
});
