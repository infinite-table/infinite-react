import { persons } from './sortPersons';

export default describe('DataSource', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/datasource/sortinfo-controlled`);
  });
  beforeEach(async () => {
    await page.reload();
  });

  it('should work correctly with sortInfo controlled', async () => {
    let result = await page.evaluate(() => {
      return JSON.parse(
        (document.querySelector('#source') as HTMLElement).innerText,
      );
    });

    expect(result).toEqual([
      {
        data: persons[0],
      },
      {
        data: persons[1],
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
        data: persons[1],
      },
      {
        data: persons[0],
      },
    ]);

    const count = await page.evaluate(() => {
      return (window as any).calls;
    });

    // expect count to be 0, as we only had a controlled change of sortInfo
    expect(count).toEqual(0);
  });
});
