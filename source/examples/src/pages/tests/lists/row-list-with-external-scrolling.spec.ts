import { test, expect } from '@playwright/test';

import { mapRowElements, withBrain } from '../testUtils/listUtils';

export default test.describe.parallel('RowListWithExternalScrolling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/lists/row-list-with-external-scrolling`);
  });

  test('should correctly render on scroll', async ({ page }) => {
    await withBrain(
      (brain) => {
        const COUNT_100 = 100;
        const ITEM_SIZE = 50;
        brain.update(COUNT_100, ITEM_SIZE);
        brain.setScrollPosition({
          scrollTop: 10,
          scrollLeft: 0,
        });
      },
      { page },
    );

    await page.waitForTimeout(30);
    let elements = await mapRowElements((el) => el.textContent, undefined, {
      page,
    });
    expect(elements).toEqual([
      'row 0',
      'row 1',
      'row 2',
      'row 3',
      'row 4',
      'row 5',
      'row 6',
    ]);

    await withBrain(
      (brain) => {
        brain.setScrollPosition({
          scrollTop: 210,
          scrollLeft: 0,
        });
      },
      { page },
    );

    await page.waitForTimeout(30);
    elements = await mapRowElements((el) => el.textContent, undefined, {
      page,
    });
    expect(elements).toEqual([
      'row 4',
      'row 5',
      'row 6',
      'row 7',
      'row 8',
      'row 9',
      'row 10',
    ]);
  });

  test('should correctly render when scrolled to the end', async ({ page }) => {
    await page.waitForTimeout(20);
    await withBrain(
      (brain) => {
        const COUNT_5 = 5;
        const ITEM_SIZE = 100;
        brain.update(COUNT_5, ITEM_SIZE);

        brain.setScrollPosition({
          scrollTop: 0,
          scrollLeft: 0,
        });
      },
      { page },
    );

    await page.waitForTimeout(20);
    let elements = await mapRowElements((el) => el.textContent, undefined, {
      page,
    });
    expect(elements).toEqual(['row 0', 'row 1', 'row 2', 'row 3']);

    await withBrain(
      (brain) => {
        brain.setScrollPosition({
          scrollTop: 220,
          scrollLeft: 0,
        });
      },
      { page },
    );

    await page.waitForTimeout(20);
    elements = await mapRowElements((el) => el.textContent, undefined, {
      page,
    });
    expect(elements).toEqual(['row 1', 'row 2', 'row 3', 'row 4']);

    await withBrain(
      (brain) => {
        brain.setScrollPosition({
          scrollTop: 320,
          scrollLeft: 0,
        });
      },
      { page },
    );

    await page.waitForTimeout(20);
    elements = await mapRowElements((el) => el.textContent, undefined, {
      page,
    });
    expect(elements).toEqual(['row 1', 'row 2', 'row 3', 'row 4']);
  });
});
