import { computeFlex } from '@components/flexbox';
import { test, expect } from '@playwright/test';

test.describe.parallel('flexbox', () => {
  test('should work on empty array', () => {
    expect(
      computeFlex({
        items: [],
        availableSize: 0,
      }),
    ).toEqual({
      flexSizes: [],
      items: [],
      computedSizes: [],
      remainingSize: 0,
    });
  });

  test('should throw on negative availableSize', () => {
    expect(() =>
      computeFlex({
        items: [],
        availableSize: -10,
      }),
    ).toThrowError('availableSize cannot be negative');
  });

  test('should throw on items with neither flex nor size', () => {
    expect(() =>
      computeFlex({
        items: [{} as { flex: number }],
        availableSize: 10,
      }),
    ).toThrowError('must specify either a size or a flex property');
  });

  test('should return same things when no items are flexed', () => {
    expect(
      computeFlex({
        availableSize: 100,
        items: [
          {
            size: 10,
          },
          { size: 30 },
        ],
      }),
    ).toEqual({
      flexSizes: [0, 0],
      computedSizes: [10, 30],
      remainingSize: 60,
      items: [
        { size: 10, computedSize: 10 },
        { size: 30, computedSize: 30 },
      ],
    });
  });

  test('should work when a flex is used', () => {
    expect(
      computeFlex({
        availableSize: 100,
        items: [
          {
            size: 10,
          },

          { flex: 1 },
          { size: 30 },
        ],
      }),
    ).toEqual({
      flexSizes: [0, 60, 0],
      computedSizes: [10, 60, 30],
      remainingSize: 0,
      items: [
        { size: 10, computedSize: 10 },
        { flex: 1, flexSize: 60, computedSize: 60 },
        { size: 30, computedSize: 30 },
      ],
    });
  });

  test('should work when 2+1 flex and flex available size = 7', () => {
    expect(
      computeFlex({
        availableSize: 10,
        items: [
          {
            size: 2,
          },

          { flex: 2 },
          { flex: 1 },
          { size: 1 },
        ],
      }),
    ).toEqual({
      flexSizes: [0, 5, 2, 0],
      computedSizes: [2, 5, 2, 1],
      remainingSize: 0,
      items: [
        { size: 2, computedSize: 2 },
        { flex: 2, flexSize: 5, computedSize: 5 },
        { flex: 1, flexSize: 2, computedSize: 2 },

        { size: 1, computedSize: 1 },
      ],
    });
  });

  test('should work when 1+2 flex and flex available size = 7', () => {
    expect(
      computeFlex({
        availableSize: 10,
        items: [
          {
            size: 2,
          },

          { flex: 1 },
          { flex: 2 },
          { size: 1 },
        ],
      }),
    ).toEqual({
      flexSizes: [0, 2, 5, 0],
      computedSizes: [2, 2, 5, 1],
      remainingSize: 0,
      items: [
        { size: 2, computedSize: 2 },
        { flex: 1, flexSize: 2, computedSize: 2 },
        { flex: 2, flexSize: 5, computedSize: 5 },
        { size: 1, computedSize: 1 },
      ],
    });
  });

  test('should work when flex available space (FAB) = 6, and flex = 1 + 2, but second flex has maxWidth = 2', () => {
    expect(
      computeFlex({
        availableSize: 8,
        items: [
          {
            size: 2,
          },
          {
            flex: 1,
          },
          {
            flex: 2,
            maxSize: 2,
          },
        ],
      }),
    ).toEqual({
      items: [
        { size: 2, computedSize: 2 },
        { flex: 1, flexSize: 4, computedSize: 4 },
        { flex: 2, maxSize: 2, flexSize: 2, computedSize: 2 },
      ],
      flexSizes: [0, 4, 2],
      remainingSize: 0,
      computedSizes: [2, 4, 2],
    });
  });

  test('should work when flex available space (FAB) = 6, and flex = 1 + 2, but first flex has minSize = 4', () => {
    const result = computeFlex({
      availableSize: 8,
      items: [
        {
          size: 2,
        },
        {
          flex: 1,
          minSize: 4,
        },
        {
          flex: 2,
        },
      ],
    });

    expect(result).toEqual({
      items: [
        { size: 2, computedSize: 2 },
        { flex: 1, minSize: 4, flexSize: 4, computedSize: 4 },
        { flex: 2, flexSize: 2, computedSize: 2 },
      ],
      remainingSize: 0,
      flexSizes: [0, 4, 2],
      computedSizes: [2, 4, 2],
    });
  });

  test('should work when flex available space (FAB) = 8, and flex = 2(max 3) + 1 + 2', () => {
    const result = computeFlex({
      availableSize: 10,
      items: [
        {
          size: 2,
        },
        {
          flex: 2,
          maxSize: 3,
        },
        {
          flex: 1,
        },
        { flex: 2 },
      ],
    });

    expect(result).toEqual({
      items: [
        { size: 2, computedSize: 2 },
        {
          flex: 2,
          maxSize: 3,
          flexSize: 3,
          computedSize: 3,
        },
        {
          flex: 1,
          flexSize: 2,
          computedSize: 2,
        },
        { flex: 2, flexSize: 3, computedSize: 3 },
      ],
      remainingSize: 0,
      flexSizes: [0, 3, 2, 3],
      computedSizes: [2, 3, 2, 3],
    });
  });
});
