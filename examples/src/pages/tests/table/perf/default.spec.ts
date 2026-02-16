import { test } from '@testing';

export default test.describe.parallel('Tracing', () => {
  test('horizontal-scrolling with tracing', async ({
    page,
    apiModel,
    tracingModel,
  }) => {
    await page.waitForInfinite();

    const stop = await tracingModel.start();
    await apiModel.evaluate((api) => {
      api.scrollLeft = 1000;
    });
    const scrollLeftMax = await apiModel.evaluate((api) => {
      return api.scrollLeftMax;
    });

    await apiModel.evaluate((api, scrollLeftMax: number) => {
      api.scrollLeft = scrollLeftMax;
    }, scrollLeftMax);

    await page.waitForTimeout(500);
    await stop();
  });

  test.skip('vertical-scrolling', async ({ page, apiModel, tracingModel }) => {
    await page.waitForInfinite();

    const stop = await tracingModel.start();
    await apiModel.evaluate((api) => {
      api.scrollTop = 1000;
    });
    const scrollTopMax = await apiModel.evaluate((api) => {
      return api.scrollTopMax;
    });

    await apiModel.evaluate((api, scrollTopMax: number) => {
      api.scrollTop = scrollTopMax;
    }, scrollTopMax);

    await page.waitForTimeout(500);
    await stop();
  });
});
