import { test, expect } from '@testing';
import { Request } from '@playwright/test';

export default test.describe
  .parallel('Server-side grouped with agg and no pivot', () => {
  test('should work and lazily load data that has a child dataset', async ({
    page,
    rowModel,
  }) => {
    const urls: string[] = [];

    // record every matching request exactly once - using page.waitForRequest
    // with a side-effecting predicate is racy, as the predicate runs once per
    // pending waiter, so the same request can be recorded multiple times
    page.on('request', (request: Request) => {
      if (request.url().includes('developers10') && request.method() === 'GET') {
        urls.push(request.url());
      }
    });

    await page.load();

    // wait for the initial request + for Canada to be loaded as well, from
    // the remote location
    await expect.poll(() => urls.length).toBeGreaterThanOrEqual(2);
    // also wait for node to be expanded
    await page.waitForTimeout(150);

    const queryStrings = urls.map((url) => url.slice(url.indexOf('?')));

    const paramsForRequests = queryStrings.map((query) => {
      const searchParams = new URLSearchParams(query);

      const obj: any = {};
      for (const [key, value] of searchParams) {
        obj[key] = value ? JSON.parse(value) : '';
      }
      return obj;
    });

    expect(urls.length).toEqual(2);

    const contents = await rowModel.getTextForColumnCells({
      colId: 'group-by-country',
    });

    expect(paramsForRequests[1].groupKeys).toEqual(['Canada']);

    expect(contents).toEqual([
      'Canada',
      // Canada was expanded, so the group text is empty for that, as we're in a child row
      '',
      'France',
      // France comes with a child dataset already loaded, so the group text is empty for that, as we're in a child row
      '',
      'Germany',
      'India',
      'Mexico',
      'Sweden',
      'United Arab Emirates',
      'United States',
    ]);
  });
});
