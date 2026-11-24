import { test, expect } from '@testing';

import {
  getLayoutErrors,
  getScrollMax,
  getScrollPosition,
  getScrollPositions,
  scrollGridTo,
} from './pinnedStartEndChecks';

const POLL = { timeout: 3000 };

export default test.describe('Pinned columns with column groups', () => {
  test.beforeEach(async () => {
    test.setTimeout(60_000);
  });

  test('group headers span their columns, in the pinned and unpinned areas, at every scroll position', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await expect
      .poll(() => getLayoutErrors(page, { withGroups: true }), POLL)
      .toEqual([]);

    const groupIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-group-id]'))
        .map((node) => node.dataset.groupId)
        .sort(),
    );
    // the outer group is split by c3, which is pinned at the end
    expect(groupIds).toEqual([
      'inner,c1,c2',
      'outer,c1,c2,c4,c5',
      'pinnedEndGroup,c3,c19',
      'pinnedStartGroup,c0,c7',
    ]);

    const max = await getScrollMax(page);
    for (const position of getScrollPositions(max)) {
      await scrollGridTo(page, position);
      await expect.poll(() => getScrollPosition(page), POLL).toEqual(position);
      await expect
        .poll(
          async () => [
            `scrollLeft ${position.scrollLeft} scrollTop ${position.scrollTop}`,
            ...(await getLayoutErrors(page, { withGroups: true })),
          ],
          POLL,
        )
        .toEqual([
          `scrollLeft ${position.scrollLeft} scrollTop ${position.scrollTop}`,
        ]);
    }
  });
});
