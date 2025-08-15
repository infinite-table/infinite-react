import { test, expect } from '@playwright/test';

import { polyContainsPoint } from '@src/utils/pageGeometry/polyContainsPoint';

export default test.describe.parallel('polyContainsPoint', () => {
  test('contains point should be fine - even when points are not in correct order', async ({}) => {
    const contained = polyContainsPoint(
      [
        {
          top: 0,
          left: 0,
        },
        {
          top: 0,
          left: 100,
        },
        {
          top: 100,
          left: 0,
        },
        {
          top: 100,
          left: 100,
        },
      ],
      {
        top: 50,
        left: 90,
      },
    );

    expect(contained).toBe(true);
  });

  test('strange poly should work', async ({}) => {
    const contained = polyContainsPoint(
      [
        { top: 86, left: 1 },
        { top: 86, left: 1 },
        { top: 56, left: 1 },
        { top: 56, left: 1 },
      ],
      {
        left: 901,
        top: 71,
      },
    );

    expect(contained).toBe(false);
  });
});
