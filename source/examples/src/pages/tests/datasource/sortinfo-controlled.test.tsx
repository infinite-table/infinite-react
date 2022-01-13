import { persons } from './sortPersons';

export default describe('DataSource', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/datasource/sortinfo-controlled`);
  });
  beforeEach(async () => {
    await page.reload();
  });

  it('should work correctly with sortInfo controlled - no change to the datasource if controlled sortInfo', async () => {
    let result = await page.evaluate(() => {
      return JSON.parse(
        (document.querySelector('#source') as HTMLElement).innerText,
      );
    });

    expect(result).toEqual([
      {
        data: persons[0],
        collapsed: true,
        id: persons[0].id,
        indexInAll: 0,
        indexInGroup: 0,
        isGroupRow: false,
      },
      {
        data: persons[1],
        collapsed: true,
        id: persons[1].id,
        indexInAll: 1,
        indexInGroup: 1,
        isGroupRow: false,
      },
    ]);

    await page.waitForTimeout(50);

    await page.evaluate(() => {
      (window as any).setSortInfo([{ dir: -1, field: 'age' }]);
    });

    result = await page.evaluate(() => {
      return JSON.parse(
        (document.querySelector('#source') as HTMLElement).innerText,
      );
    });

    expect(result).toEqual([
      {
        data: persons[0],
        id: persons[0].id,
        collapsed: true,
        indexInAll: 0,
        indexInGroup: 0,
        isGroupRow: false,
      },
      {
        collapsed: true,
        data: persons[1],
        indexInAll: 1,
        indexInGroup: 1,
        id: persons[1].id,
        isGroupRow: false,
      },
    ]);

    const count = await page.evaluate(() => {
      return (window as any).calls;
    });

    // expect count to be 0, as we only had a controlled change of sortInfo
    expect(count).toEqual(0);
  });
});
