import { test, expect } from '@testing';

import { getCellNode, getComputedStyleProperty } from '../../../testUtils';

export default test.describe.parallel('groupBy.column.style', () => {
  test('should correctly apply styles', async ({ page }) => {
    const node1 = await getCellNode(
      { columnId: 'group-by-country', rowIndex: 0 },
      { page },
    );
    const node2 = await getCellNode(
      { columnId: 'group-by-city', rowIndex: 1 },
      { page },
    );

    const color1 = await getComputedStyleProperty(node1!, 'color', { page });
    expect(color1).toEqual('rgb(255, 0, 0)');

    const color2 = await getComputedStyleProperty(node2!, 'color', { page });
    expect(color2).toEqual('rgb(0, 0, 255)');
  });
});
