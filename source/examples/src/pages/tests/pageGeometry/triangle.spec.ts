import { test, expect } from '@playwright/test';

import { Triangle } from '@src/utils/pageGeometry/Triangle';

export default test.describe.parallel('Triangle', () => {
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
