import { InfiniteTableApi } from '@infinite-table/infinite-react';
import { test } from '@testing';

export default test.describe.parallel('Tracing', () => {
  test.skip('horizontal-scrolling', async ({ page, tracingModel }) => {
    await page.waitForInfinite();

    const stop = await tracingModel.start();

    await page.evaluate(() => {
      const api = (globalThis as any).INFINITE_API as InfiniteTableApi<any>;
      const scrollLeftMax = api.scrollLeftMax;

      return api.scrollContainer.scroll({
        left: scrollLeftMax,
        behavior: 'smooth',
      });
    });
    // console.log('scrollMax', scrollMax);
    // const scrollPositions = Array.from({ length: 100 }, (_, i) => i * 1000);

    // for (const scrollPosition of scrollPositions) {
    //   await apiModel.evaluate((api, scrollPosition) => {
    //     api.scrollLeft = scrollPosition;
    //   }, scrollPosition);
    // }

    await page.waitForTimeout(1000);

    await stop();
  });

  test.skip('vertical-scrolling', async ({ page, apiModel, tracingModel }) => {
    await page.waitForInfinite();

    await page.click('button');

    await page.waitForTimeout(100);

    const stop = await tracingModel.start();

    const scrollPositions = Array.from({ length: 100 }, (_, i) => i * 1000);

    for (const scrollPosition of scrollPositions) {
      await apiModel.evaluate((api, scrollPosition) => {
        api.scrollTop = scrollPosition;
      }, scrollPosition);
    }

    await page.waitForTimeout(1000);

    await stop();
  });
});
