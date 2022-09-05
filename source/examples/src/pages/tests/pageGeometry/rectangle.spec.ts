import { test, expect } from '@playwright/test';

import { Rectangle } from '@src/utils/pageGeometry/Rectangle';

export default test.describe.parallel('Rectangle', () => {
  test('contains point should be fine - test moving point vertically', async ({}) => {
    const r = new Rectangle({
      top: 0,
      left: 0,
      width: 10,
      height: 3,
    });

    // left is 5
    expect(
      r.containsPoint({
        top: 0,
        left: 5,
      }),
    ).toBe(true);
    expect(
      r.containsPoint({
        top: 1,
        left: 5,
      }),
    ).toBe(true);
    expect(
      r.containsPoint({
        top: 2,
        left: 5,
      }),
    ).toBe(true);
    expect(
      r.containsPoint({
        top: 3,
        left: 5,
      }),
    ).toBe(true);

    expect(
      r.containsPoint({
        top: 4,
        left: 5,
      }),
    ).toBe(false);

    // left is 2
    expect(
      r.containsPoint({
        top: 0,
        left: 2,
      }),
    ).toBe(true);
    expect(
      r.containsPoint({
        top: 1,
        left: 2,
      }),
    ).toBe(true);
    expect(
      r.containsPoint({
        top: 2,
        left: 2,
      }),
    ).toBe(true);
    expect(
      r.containsPoint({
        top: 3,
        left: 2,
      }),
    ).toBe(true);

    expect(
      r.containsPoint({
        top: 4,
        left: 2,
      }),
    ).toBe(false);
  });

  test('contains point should be fine - test moving point horizontally', async ({}) => {
    const r = new Rectangle({
      top: 0,
      left: 0,
      width: 6,
      height: 5,
    });

    // top is 2
    expect(
      r.containsPoint({
        top: 2,
        left: 0,
      }),
    ).toBe(true);
    expect(
      r.containsPoint({
        top: 2,
        left: 1,
      }),
    ).toBe(true);
    expect(
      r.containsPoint({
        top: 2,
        left: 2,
      }),
    ).toBe(true);

    expect(
      r.containsPoint({
        top: 2,
        left: 3,
      }),
    ).toBe(true);

    expect(
      r.containsPoint({
        top: 2,
        left: 4,
      }),
    ).toBe(true);

    expect(
      r.containsPoint({
        top: 2,
        left: 5,
      }),
    ).toBe(true);

    expect(
      r.containsPoint({
        top: 2,
        left: 6,
      }),
    ).toBe(true);

    expect(
      r.containsPoint({
        top: 2,
        left: 7,
      }),
    ).toBe(false);
  });

  test('contains point should be fine - test moving point horizontally - with negative values', async ({}) => {
    const r = new Rectangle({
      top: 0,
      left: -2,
      width: 7,
      height: 5,
    });

    // top is 2
    expect(
      r.containsPoint({
        top: 2,
        left: -2,
      }),
    ).toBe(true);
    expect(
      r.containsPoint({
        top: 2,
        left: -1,
      }),
    ).toBe(true);
    expect(
      r.containsPoint({
        top: 2,
        left: 0,
      }),
    ).toBe(true);

    expect(
      r.containsPoint({
        top: 2,
        left: 1,
      }),
    ).toBe(true);

    expect(
      r.containsPoint({
        top: 2,
        left: 2,
      }),
    ).toBe(true);

    expect(
      r.containsPoint({
        top: 2,
        left: 3,
      }),
    ).toBe(true);

    expect(
      r.containsPoint({
        top: 2,
        left: 4,
      }),
    ).toBe(true);

    expect(
      r.containsPoint({
        top: 2,
        left: 5,
      }),
    ).toBe(true);
  });

  test('intersects works', () => {
    const r1 = new Rectangle({
      top: 0,
      left: 0,
      width: 10,
      height: 10,
    });

    const r2 = new Rectangle({
      top: 0,
      left: 10,
      width: 10,
      height: 10,
    });

    const r3 = new Rectangle({
      top: 0,
      left: 11,
      width: 10,
      height: 10,
    });

    expect(r1.intersects(r2)).toBe(true);
    expect(r1.intersects(r3)).toBe(false);
  });

  test('intersects special case - r2 nested inside r1', () => {
    const r1 = new Rectangle({
      top: 0,
      left: 0,
      width: 10,
      height: 10,
    });

    const r2 = new Rectangle({
      top: 2,
      left: 2,
      width: 2,
      height: 2,
    });

    expect(r1.intersects(r2)).toBe(true);
    expect(r2.intersects(r1)).toBe(true);
  });
});
