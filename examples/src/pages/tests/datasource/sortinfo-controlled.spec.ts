import { test, expect } from '@testing';

import { persons } from './sortPersons';

export default test.describe.parallel('DataSource', () => {
  test('should work correctly with sortInfo controlled - no change to the datasource if controlled sortInfo', async ({
    page,
  }) => {
    await page.load();
    // wait for the app to mount and for the DataSource to finish loading
    // (#source renders "loading" until the data promise resolves)
    await page.waitForFunction(() => {
      const el = document.querySelector('#source') as HTMLElement | null;
      if (!el) {
        return false;
      }
      try {
        return Array.isArray(JSON.parse(el.innerText));
      } catch {
        return false;
      }
    });
    let result = await page.evaluate(() => {
      return JSON.parse(
        (document.querySelector('#source') as HTMLElement).innerText,
      );
    });

    expect(result).toEqual([
      {
        data: persons[0],
        id: persons[0].id,
        indexInAll: 0,

        rowSelected: false,
        rowDisabled: false,
        isTreeNode: false,
        isGroupRow: false,
        selfLoaded: true,
        dataSourceHasGrouping: false,
      },
      {
        data: persons[1],
        id: persons[1].id,
        indexInAll: 1,
        rowSelected: false,
        rowDisabled: false,
        isTreeNode: false,
        isGroupRow: false,
        selfLoaded: true,
        dataSourceHasGrouping: false,
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
        dataSourceHasGrouping: false,
        indexInAll: 0,
        rowSelected: false,
        rowDisabled: false,
        // indexInGroup: 0,
        isGroupRow: false,
        isTreeNode: false,
        selfLoaded: true,
      },
      {
        dataSourceHasGrouping: false,
        data: persons[1],
        indexInAll: 1,
        rowSelected: false,
        rowDisabled: false,
        // indexInGroup: 1,
        id: persons[1].id,
        isGroupRow: false,
        isTreeNode: false,
        selfLoaded: true,
      },
    ]);

    const count = await page.evaluate(() => {
      return (window as any).calls;
    });

    // expect count to be 0, as we only had a controlled change of sortInfo
    expect(count).toEqual(0);
  });
});
