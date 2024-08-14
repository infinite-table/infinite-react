import { test, expect } from '@testing';

const COL_IDS = [
  'a1',
  'b1',
  'c1',
  'd1',
  'a2',
  'b2',
  'c2',
  'd2',
  'a3',
  'b3',
  'c3',
  'd3',
];

export default test.describe.parallel('Column Group Visibility', () => {
  test('works correctly', async ({ page, columnModel }) => {
    await page.waitForInfiniteHeader();

    let colGroupIds = await columnModel.getVisibleColumnGroupIds();
    let colIds = await columnModel.getVisibleColumnIds();

    expect(colGroupIds).toEqual([
      '1,a1,b1,c1,d1',
      '2,a2,b2,c2,d2',
      '3,a3,b3,c3,d3',
    ]);
    expect(colIds).toEqual(COL_IDS);

    await page.getByText('toggle group 1').click();

    colIds = await columnModel.getVisibleColumnIds();
    colGroupIds = await columnModel.getVisibleColumnGroupIds();

    expect(colGroupIds).toEqual(['2,a2,b2,c2,d2', '3,a3,b3,c3,d3']);
    expect(colIds).toEqual(COL_IDS);

    await page.getByText('toggle group 2').click();

    colIds = await columnModel.getVisibleColumnIds();
    colGroupIds = await columnModel.getVisibleColumnGroupIds();
    expect(colGroupIds).toEqual(['3,a3,b3,c3,d3']);
    expect(colIds).toEqual(COL_IDS);

    await page.getByText('toggle group 3').click();

    colIds = await columnModel.getVisibleColumnIds();
    colGroupIds = await columnModel.getVisibleColumnGroupIds();
    expect(colGroupIds).toEqual([]);
    expect(colIds).toEqual(COL_IDS);
  });
});
