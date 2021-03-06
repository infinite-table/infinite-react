import { moveXatY } from '@src/components/InfiniteTable/utils/moveXatY';
import { test, expect } from '@playwright/test';
export default test.describe.parallel('moveXatY', () => {
  test('should behave correctly case 1', () => {
    const arr = [1, 2, 3, 4];
    expect(moveXatY(arr, 2, 0)).toEqual([3, 1, 2, 4]);
    expect(moveXatY(arr, 0, 1)).toEqual([2, 1, 3, 4]);
  });
  test('should behave correctly case 2', () => {
    const arr = [1, 2, 3, 4];
    expect(moveXatY(arr, 3, 3)).toEqual([1, 2, 3, 4]);
    expect(moveXatY(arr, 3, 4)).toEqual([1, 2, 3, 4]);
    expect(moveXatY(arr, 3, 0)).toEqual([4, 1, 2, 3]);
  });
  test('should behave correctly case 3', () => {
    const arr = [1, 2];
    expect(moveXatY(arr, 0, 1)).toEqual([2, 1]);
    // nothing should happen as index is outside of range
    expect(moveXatY(arr, 0, 2)).toEqual([1, 2]);
  });
  test('should behave correctly case 4', () => {
    const arr = [1, 2, 3, 4, 5, 6];
    expect(moveXatY(arr, 2, 3)).toEqual([1, 2, 4, 3, 5, 6]);
  });
});
