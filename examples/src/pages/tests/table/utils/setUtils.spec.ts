import { test, expect } from '@playwright/test';
import { setFilter, setIntersection } from '@src/utils/setUtils';

export default test.describe('setUtils', () => {
  test('setIntersection should work properly', () => {
    const a = new Set([1, 2, 3]);

    const b = new Set([3, 4, 5]);

    const result = setIntersection(a, b);
    expect(result).toEqual(new Set([3]));
  });

  test('setFilter should work properly', () => {
    const a = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const result = setFilter(a, (x) => x % 2 === 0);
    expect(result).toEqual(new Set([2, 4, 6, 8, 10]));
  });
});
