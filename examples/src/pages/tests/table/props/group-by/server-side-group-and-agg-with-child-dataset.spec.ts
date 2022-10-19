import { test, expect } from '@testing';
import { Request } from '@playwright/test';

export default test.describe.parallel(
  'Server-side grouped with agg and no pivot',
  () => {
    test('should work and lazily load data that has a child dataset', async ({
      page,
      rowModel,
    }) => {
      const urls: string[] = [];

      const condition = (request: Request) => {
        const ok =
          request.url().includes('developers10') && request.method() === 'GET';

        if (ok) {
          urls.push(request.url());
        }

        return ok;
      };

      // wait for initial request
      page.waitForRequest(condition);

      await page.load();

      // wait for Canada to be loaded as well, from the remote location
      await page.waitForRequest(condition);
      // also wait for node to be expanded
      await page.waitForTimeout(40);

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
  },
);
