import { test, expect } from '@playwright/test';

import { getGreatestCountVisibleInSize } from '@src/components/VirtualBrain/getGreatestCountVisibleInSize';

export default test.describe.parallel('getGreatestCountVisibleInSize', () => {
  test.beforeEach(({ page }) => {
    globalThis.__DEV__ = true;
    page.on('console', async (msg) => {
      const values = [];
      for (const arg of msg.args()) values.push(await arg.jsonValue());
      console.log(...values);
    });
  });

  test('basic scenario', async () => {
    expect(getGreatestCountVisibleInSize(100, [10, 20, 30, 40])).toBe(4);
    expect(getGreatestCountVisibleInSize(100, [30, 30, 30, 30, 30, 30])).toBe(
      4,
    );
    expect(getGreatestCountVisibleInSize(100, [31, 30, 30, 30, 30, 30])).toBe(
      4,
    );
  });
  test('edge case', async () => {
    expect(getGreatestCountVisibleInSize(3, [5, 2, 5, 2, 2])).toBe(2);
  });
});
