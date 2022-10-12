import { Request } from '@playwright/test';
import { test, expect } from '@testing';
import { getCellText } from '../../../testUtils';

export default test.describe.parallel(
  'Server-side grouping with lazy load and batching',
  () => {
    test('should load expanded rows', async ({ page }) => {
      page.load();
      const urls: string[] = [];

      const condition = (request: Request) => {
        const ok =
          request.url().includes('developers10') && request.method() === 'GET';

        if (ok) {
          urls.push(request.url());
        }

        return ok;
      };

      // wait for initial call
      await page.waitForRequest(condition);
      // wait for france to be requested
      await page.waitForRequest(condition);

      const queryStrings = urls.map((url) => url.slice(url.indexOf('?')));

      const paramsForRequests = queryStrings.map((query) => {
        const searchParams = new URLSearchParams(query);

        const obj: any = {};
        for (const [key, value] of searchParams) {
          obj[key] = JSON.parse(value);
        }
        return obj;
      });

      // expect a request was made for France
      expect(paramsForRequests[1].groupKeys).toEqual(['France']);

      const firstFrance = await getCellText(
        { columnId: 'country', rowIndex: 1 },
        { page },
      );
      const secondFrance = await getCellText(
        { columnId: 'country', rowIndex: 1 },
        { page },
      );

      expect(firstFrance).toBe('France');
      expect(secondFrance).toBe('France');
    });
  },
);
