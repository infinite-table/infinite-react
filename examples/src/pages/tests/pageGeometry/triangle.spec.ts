import { test, expect } from '@playwright/test';

import { Triangle } from '@src/utils/pageGeometry/Triangle';

export default test.describe.parallel('Triangle', () => {
  test('strange triangle should work', async ({}) => {
    const t = new Triangle([
      { top: 86, left: 1 },
      { top: 86, left: 1 },
      { top: 56, left: 1 },
    ]);

    expect(t.containsPoint({ top: 71, left: 901 })).toBe(false);
    expect(t.containsPoint({ top: 86, left: 1 })).toBe(true);
    expect(t.containsPoint({ top: 86, left: 2 })).toBe(false);
  });
  test('contains point should be fine - test moving point horizontally', async ({}) => {
    const t = new Triangle([
      {
        left: 0,
        top: 0,
      },
      { left: 0, top: 3 },
      {
        left: 3,
        top: 0,
      },
    ]);

    expect(
      t.containsPoint({
        top: 1,
        left: 0,
      }),
    ).toBe(true);

    expect(
      t.containsPoint({
        top: 1,
        left: 1,
      }),
    ).toBe(true);

    expect(
      t.containsPoint({
        top: 1,
        left: 2,
      }),
    ).toBe(true);

    expect(
      t.containsPoint({
        top: 1,
        left: 4,
      }),
    ).toBe(false);

    expect(
      t.containsPoint({
        top: 2,
        left: 3,
      }),
    ).toBe(false);
  });
});
