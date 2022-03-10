import { getColumnCells } from '../../../testUtils';

const getColumnContents = async (colId: string) => {
  const cells = await getColumnCells(colId);

  const result = await Promise.all(
    cells.bodyCells.map(
      async (cell: any) => await cell.evaluate((node: any) => node.innerText),
    ),
  );

  return result;
};

export default describe('Server-side batched grouping with pinned group column.', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/group-by/server-side-grouping-and-batching`,
    );
  });

  beforeEach(async () => {
    await page.reload();

    // wait for rendering
    await page.waitForSelector('[data-row-index]');
  });

  it('should work and lazily load data', async () => {
    await page.waitForTimeout(50);
    let cells = await getColumnContents('group-col');

    const firstBatch = ['Argentina', 'Australia', 'Brazil', 'Canada', 'China'];
    expect(cells.filter(Boolean)).toEqual(firstBatch);

    await page.waitForTimeout(350);

    cells = await getColumnContents('group-col');

    expect(cells.slice(0, 10).filter(Boolean)).toEqual([
      ...firstBatch,
      'France',
      'Germany',
      'India',
      'Indonesia',
      'Italy',
    ]);
  });
});
