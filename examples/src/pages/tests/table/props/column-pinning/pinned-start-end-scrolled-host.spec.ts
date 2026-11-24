import { test, expect } from '@testing';

import {
  getLayoutErrors,
  getScrollMax,
  getScrollPosition,
  scrollGridTo,
} from './pinnedStartEndChecks';

const POLL = { timeout: 3000 };

const scrollPage = (
  page: any,
  position: { page: number; hostTop: number; hostLeft: number },
) =>
  page.evaluate((position: any) => {
    document.getElementById('page')!.scrollTop = position.page;
    const host = document.getElementById('host')!;
    host.scrollTop = position.hostTop;
    host.scrollLeft = position.hostLeft;
  }, position);

const getHostScroll = (page: any) =>
  page.evaluate(() => {
    const host = document.getElementById('host')!;
    return {
      page: document.getElementById('page')!.scrollTop,
      hostTop: host.scrollTop,
      hostLeft: host.scrollLeft,
    };
  });

export default test.describe('Pinned columns in a grid inside scrolled containers', () => {
  test.beforeEach(async () => {
    test.setTimeout(60_000);
  });

  test('the body stays in the grid when the page and the grid container are scrolled', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);

    for (const position of [
      { page: 120, hostTop: 0, hostLeft: 0 },
      { page: 120, hostTop: 230, hostLeft: 0 },
      { page: 200, hostTop: 230, hostLeft: 90 },
      { page: 0, hostTop: 400, hostLeft: 300 },
    ]) {
      await scrollPage(page, position);
      await expect.poll(() => getHostScroll(page), POLL).toEqual(position);
      await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);

      const max = await getScrollMax(page);
      for (const gridPosition of [
        { scrollLeft: 333, scrollTop: 500 },
        { scrollLeft: max.scrollLeftMax, scrollTop: max.scrollTopMax },
        { scrollLeft: 0, scrollTop: 0 },
      ]) {
        await scrollGridTo(page, gridPosition);
        await expect
          .poll(() => getScrollPosition(page), POLL)
          .toEqual(gridPosition);
        await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);
      }
    }
  });

  test('the wheel over the pinned columns scrolls the grid, not its container', async ({
    page,
  }) => {
    await page.waitForInfinite();
    const position = { page: 100, hostTop: 200, hostLeft: 60 };
    await scrollPage(page, position);
    await expect.poll(() => getHostScroll(page), POLL).toEqual(position);

    const box = (await page
      .locator('.InfiniteVirtualScrollContainer')
      .boundingBox())!;
    for (const x of [box.x + 30, box.x + box.width - 30]) {
      const before = await getScrollPosition(page);
      await page.mouse.move(x, box.y + box.height / 2);
      await page.mouse.wheel(0, 300);
      await page.mouse.wheel(120, 0);
      await expect
        .poll(() => getScrollPosition(page), POLL)
        .toEqual({
          scrollLeft: before.scrollLeft + 120,
          scrollTop: before.scrollTop + 300,
        });
      expect(await getHostScroll(page)).toEqual(position);
      await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);
    }
  });
});
