import { test, expect } from '@playwright/test';

import { Point } from '@src/utils/pageGeometry/Point';

export default test.describe.parallel('Point', () => {
  test('getDistanceToPoint - 1', async ({}) => {
    const p1 = new Point({
      top: 10,
      left: 20,
    });
    const p2 = new Point({
      top: -5,
      left: -3,
    });

    expect(
      p1.getDistanceToPoint({
        top: 15,
        left: 35,
      }),
    ).toEqual({
      top: 5,
      left: 15,
    });

    expect(
      p1.getDistanceToPoint({
        top: 1,
        left: -4,
      }),
    ).toEqual({
      top: -9,
      left: -24,
    });

    expect(
      Point.from(p1).shift(
        p1.getDistanceToPoint({
          top: 1,
          left: -4,
        }),
      ),
    ).toEqual({
      top: 1,
      left: -4,
    });

    expect(Point.from(p2).shift(p2.getDistanceToPoint(p1))).toEqual(p1);
    expect(Point.from(p1).shift(p1.getDistanceToPoint(p2))).toEqual(p2);
  });
});
