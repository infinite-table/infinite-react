import { ElementHandle } from 'puppeteer';
import { getColumnCells, getGlobalFnCalls } from '../../../../../utils';

const getSortInfoCallsCount = () => (window as any).sortInfos.length;
const getCalls = getGlobalFnCalls('onSortInfoChange');

export default describe('Table', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/sortInfo/uncontrolled-single`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('uncontrolled sortInfo should work fine', async () => {
    await page.waitForTimeout(50);
    const { headerCell, bodyCells } = await getColumnCells('OrderId');

    let values = await Promise.all(
      // the first one is the header
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(['1', '20', '2', '3']);

    // click the column header
    await headerCell.click();

    await page.waitForTimeout(20);

    // refetch values
    values = await Promise.all(
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(['1', '2', '3', '20']);

    // expect the onSortInfo callback to have been called once
    let calls = await getCalls();
    expect(calls.length).toEqual(1);
    expect(calls[0].args[0]).toMatchObject({
      dir: 1,
      id: 'OrderId',
    });

    // click the column header again
    await headerCell.click();

    // expect the onSortInfo callback to have been called twice

    calls = await getCalls();
    expect(calls.length).toEqual(2);

    expect(calls[1].args[0]).toMatchObject({
      dir: -1,
      id: 'OrderId',
    });

    // refetch values
    values = await Promise.all(
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(['20', '3', '2', '1']);
  });
});
