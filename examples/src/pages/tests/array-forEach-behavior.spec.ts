import { test, expect } from '@playwright/test';

export default test.describe.parallel('[].forEach', () => {
  test('insert element before element', async () => {
    const array = [1, 2, 3, 4, 5];

    for (let i = 0; i < array.length; i++) {
      const el = array[i];
      if (el === 3) {
        array.splice(i, 0, 111);
        i++;
      }
    }

    expect(array).toEqual([1, 2, 111, 3, 4, 5]);
  });

  test('insert element after element', async () => {
    const array = [1, 2, 3, 4, 5];

    for (let i = 0; i < array.length; i++) {
      const el = array[i];
      if (el === 5) {
        array.splice(i + 1, 0, 111);
        i++;
      }
    }

    expect(array).toEqual([1, 2, 3, 4, 5, 111]);
  });

  test('insert element after element - case 2', async () => {
    const array = [1, 2, 3, 4, 5];

    for (let i = 0; i < array.length; i++) {
      const el = array[i];
      if (el === 3) {
        array.splice(i + 1, 0, 111);
        i++;
      }
    }

    expect(array).toEqual([1, 2, 3, 111, 4, 5]);
  });

  test('delete element while looping', async () => {
    const array = [1, 2, 3, 4, 5];

    for (let i = 0; i < array.length; i++) {
      const el = array[i];
      if (el === 3) {
        array.splice(i, 1);
      }
    }

    expect(array).toEqual([1, 2, 4, 5]);
  });
});
