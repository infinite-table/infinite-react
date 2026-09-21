import { test, expect } from '@playwright/test';
import { computeGroupResize, computeResize } from '@src/components/flexbox';

test.describe.parallel('resize shareSpaceOnResize', () => {
  test('resize with share space should work, when resizing the last item and check maxWidth works', () => {
    const testData = {
      columnSizing: {},
      reservedWidth: 0,
      availableSize: 1000,
      dragHandleOffset: 10,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 10,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      adjustedDiff: 10,
      constrained: false,
      columnSizing: {
        a: {
          width: testData.items[0].computedWidth + testData.dragHandleOffset,
        },
      },
    });

    testData.items[0].computedMaxWidth = 20;
    testData.dragHandleOffset = 12;

    result = computeResize(testData);

    expect(result).toMatchObject({
      maxReached: true,
      columnSizing: {
        a: {
          width: testData.items[0].computedMaxWidth,
        },
      },
    });
  });

  test('shareSpaceOnResize should work when in the middle and no limits not reached', () => {
    const testData = {
      reservedWidth: 0,
      columnSizing: {},
      availableSize: 1000,
      dragHandleOffset: 10,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      columnSizing: {
        a: {
          width: testData.items[0].computedWidth + testData.dragHandleOffset,
        },
        b: {
          width: testData.items[1].computedWidth - testData.dragHandleOffset,
        },
      },
    });
  });

  test('shareSpaceOnResize should work when second item min size is reached', () => {
    const testData = {
      reservedWidth: 0,
      columnSizing: {},
      availableSize: 1000,
      dragHandleOffset: 20,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 180,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      minReached: true,
      adjustedDiff: 20,
      constrained: true,
      columnSizing: {
        a: {
          width: testData.items[0].computedWidth + testData.dragHandleOffset,
        },
        b: {
          width: testData.items[1].computedWidth - testData.dragHandleOffset,
        },
      },
    });

    // now drag to 30px, even though only 20px will work
    // but the test checks that
    testData.dragHandleOffset = 30;
    // also size using flex, not width
    testData.items[0].computedFlex = 100;
    testData.items[1].computedFlex = 200;

    result = computeResize(testData);

    expect(result).toMatchObject({
      minReached: true,
      columnSizing: {
        a: {
          flex: testData.items[0].computedWidth + 20,
        },
        b: {
          flex: testData.items[1].computedWidth - 20,
        },
      },
    });
  });

  test('shareSpaceOnResize should work when second item max size is reached', () => {
    const testData = {
      columnSizing: {},
      availableSize: 1000,
      dragHandleOffset: -60,
      reservedWidth: 0,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: 0,
          computedMaxWidth: 250,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      maxReached: true,
      adjustedDiff: -50,
      columnSizing: {
        a: {
          width: testData.items[0].computedWidth - 50,
        },
        b: {
          width: testData.items[1].computedWidth + 50,
        },
      },
    });
  });

  test('shareSpaceOnResize should work when first item max size is reached', () => {
    const testData = {
      columnSizing: {},
      availableSize: 1000,
      dragHandleOffset: 100,
      reservedWidth: 0,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 250,
          computedFlex: 250,
          computedMaxWidth: 300,
          computedMinWidth: 0,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: 0,
          computedMaxWidth: 10_000,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      maxReached: true,
      columnSizing: {
        a: {
          flex: testData.items[0].computedWidth + 50,
        },
        b: {
          width: testData.items[1].computedWidth - 50,
        },
      },
    });
  });

  test('shareSpaceOnResize should work when first item min size is reached', () => {
    const testData = {
      columnSizing: {},
      availableSize: 1000,
      dragHandleOffset: -100,
      dragHandlePositionAfter: 0,
      reservedWidth: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 250,
          computedFlex: 250,
          computedMinWidth: 200,
          computedMaxWidth: 10_000,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: 0,
          computedMaxWidth: 10_000,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      minReached: true,
      columnSizing: {
        a: {
          flex: testData.items[0].computedWidth - 50,
        },
        b: {
          width: testData.items[1].computedWidth + 50,
        },
      },
    });
  });

  test('shareSpaceOnResize should work when both items reach their limit, but first is first.minWidth', () => {
    const testData = {
      columnSizing: {},
      availableSize: 1000,
      dragHandleOffset: -100,
      dragHandlePositionAfter: 0,
      reservedWidth: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 250,
          computedFlex: 250,
          computedMinWidth: 200,
          computedMaxWidth: 10_000,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: 0,
          computedMaxWidth: 280,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      minReached: true,
      columnSizing: {
        a: {
          flex: testData.items[0].computedWidth - 50,
        },
        b: {
          width: testData.items[1].computedWidth + 50,
        },
      },
    });
  });

  test('shareSpaceOnResize should work when both items reach their limit, but first is first.maxWidth', () => {
    const testData = {
      columnSizing: {},
      availableSize: 1000,
      dragHandleOffset: 100,
      dragHandlePositionAfter: 0,
      reservedWidth: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 250,
          computedFlex: 250,
          computedMaxWidth: 270,
          computedMinWidth: 0,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: 120,
          computedMaxWidth: 10_000,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      maxReached: true,
      columnSizing: {
        a: {
          flex: testData.items[0].computedWidth + 20,
        },
        b: {
          width: testData.items[1].computedWidth - 20,
        },
      },
    });
  });

  test('shareSpaceOnResize should work when both items reach their limit, but first is second.minWidth', () => {
    const testData = {
      columnSizing: {},
      availableSize: 1000,
      dragHandleOffset: 100,
      reservedWidth: 0,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 250,
          computedFlex: 250,
          computedMinWidth: 0,
          computedMaxWidth: 340,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: 180,
          computedMaxWidth: 10_000,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      minReached: true,
      columnSizing: {
        a: {
          flex: testData.items[0].computedWidth + 20,
        },
        b: {
          width: testData.items[1].computedWidth - 20,
        },
      },
    });
  });

  test('shareSpaceOnResize should work when both items reach their limit, but first is second.maxWidth', () => {
    const testData = {
      columnSizing: {},
      availableSize: 1000,
      dragHandleOffset: -100,
      dragHandlePositionAfter: 0,
      reservedWidth: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 250,
          computedFlex: 250,
          computedMinWidth: 200,
          computedMaxWidth: 10_000,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: 0,
          computedMaxWidth: 220,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      maxReached: true,
      columnSizing: {
        a: {
          flex: testData.items[0].computedWidth - 20,
        },
        b: {
          width: testData.items[1].computedWidth + 20,
        },
      },
    });
  });
});

test.describe.parallel('resize normal', () => {
  test('should work when no limit reached', () => {
    const testData = {
      columnSizing: {},
      availableSize: 1000,
      dragHandleOffset: 10,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: false,
      reservedWidth: 0,
      items: [
        {
          id: 'a',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      columnSizing: {
        a: {
          width: testData.items[0].computedWidth + testData.dragHandleOffset,
        },
      },
    });
  });

  test.skip('should take reservedWidth into account ', () => {
    const testData = {
      columnSizing: {},
      availableSize: 400,
      reservedWidth: 50,
      dragHandleOffset: 100,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: false,
      items: [
        {
          id: 'a',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      columnSizing: {
        a: {
          width: testData.items[0].computedWidth + 50,
        },
      },
    });
  });

  test('should take minWidth into account', () => {
    const testData = {
      columnSizing: {},
      availableSize: 400,
      dragHandleOffset: -50,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: false,
      reservedWidth: 100,
      items: [
        {
          id: 'a',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 70,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMaxWidth: 200,
          computedMinWidth: 0,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      adjustedDiff: -30,
      reservedWidth: 130,
      minReached: true,
      constrained: true,
      columnSizing: {
        a: {
          width: testData.items[0].computedWidth - 30,
        },
      },
    });
  });
});

/**
 * When the fixed columns alone exceed the available size, flex columns sit at
 * their min width and there is nothing left to flex into - so a resized flex
 * column gets a fixed width instead of a (meaningless) flex value.
 */
test.describe.parallel('resize flex columns with no space to flex', () => {
  const flexItem = (id: string, width: number) => ({
    id,
    computedWidth: width,
    computedFlex: width,
    computedMinWidth: 30,
    computedMaxWidth: 10_000,
  });
  const fixedItem = (id: string, width: number) => ({
    id,
    computedWidth: width,
    computedFlex: 0,
    computedMinWidth: 30,
    computedMaxWidth: 10_000,
  });

  test('resized flex column becomes a fixed width column', () => {
    const result = computeResize({
      // a is min-clamped: 30 + 200 + 200 = 430 > 300
      columnSizing: { a: { flex: 30 } },
      availableSize: 300,
      reservedWidth: 0,
      dragHandleOffset: 100,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: false,
      items: [flexItem('a', 30), fixedItem('b', 200), fixedItem('c', 200)],
    });

    expect(result).toMatchObject({
      adjustedDiff: 100,
      reservedWidth: -100,
      constrained: false,
    });
    // width, and no flex left behind - flex would win over width
    expect(result.columnSizing.a).toEqual({ width: 130 });
  });

  test('flex is kept when the columns fit the available size', () => {
    const items = [flexItem('a', 30), fixedItem('b', 200), fixedItem('c', 200)];

    let result = computeResize({
      columnSizing: { a: { flex: 30 } },
      availableSize: 430,
      reservedWidth: 0,
      dragHandleOffset: 100,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: false,
      items,
    });
    expect(result.columnSizing.a).toEqual({ flex: 130 });

    // a negative reserved width (from earlier resizes) also counts as space
    result = computeResize({
      columnSizing: { a: { flex: 30 } },
      availableSize: 300,
      reservedWidth: -130,
      dragHandleOffset: 100,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: false,
      items,
    });
    expect(result.columnSizing.a).toEqual({ flex: 130 });
  });

  test('share space: a min-clamped flex neighbour also gets a fixed width', () => {
    const result = computeResize({
      columnSizing: { b: { flex: 30 } },
      availableSize: 200,
      reservedWidth: 0,
      dragHandleOffset: -50,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: true,
      items: [fixedItem('a', 200), flexItem('b', 30)],
    });

    expect(result).toMatchObject({
      adjustedDiff: -50,
      reservedWidth: 0,
    });
    expect(result.columnSizing.a).toEqual({ width: 150 });
    expect(result.columnSizing.b).toEqual({ width: 80 });
  });

  test('group resize: min-clamped flex columns in the group get fixed widths', () => {
    const result = computeGroupResize({
      columnSizing: { a: { flex: 30 }, b: { flex: 30 } },
      availableSize: 200,
      reservedWidth: 0,
      dragHandleOffset: 60,
      dragHandlePositionAfter: 1,
      columnGroupSize: 2,
      items: [
        { ...flexItem('a', 30), resizable: true },
        { ...flexItem('b', 30), resizable: true },
        { ...fixedItem('c', 300), resizable: true },
      ],
    });

    expect(result).toMatchObject({
      adjustedDiffs: [30, 30],
      reservedWidth: -60,
    });
    expect(result.columnSizing.a).toEqual({ width: 60 });
    expect(result.columnSizing.b).toEqual({ width: 60 });
  });
});

test.describe.parallel('resize produces integer sizes', () => {
  test('fractional computed widths are rounded in the result', () => {
    const result = computeResize({
      columnSizing: { a: { flex: 100.4 } },
      // 100.4 + 199.6 = 300 - the columns fit exactly, so flex is kept
      availableSize: 300,
      reservedWidth: 0,
      dragHandleOffset: 10,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: false,
      items: [
        {
          id: 'a',
          computedWidth: 100.4,
          computedFlex: 100.4,
          computedMinWidth: 30,
          computedMaxWidth: 10_000,
        },
        {
          id: 'b',
          computedWidth: 199.6,
          computedFlex: 0,
          computedMinWidth: 30,
          computedMaxWidth: 10_000,
        },
      ],
    });

    expect(result.columnSizing.a).toEqual({ flex: 110 });
    expect(Number.isInteger(result.reservedWidth)).toBe(true);
    expect(result.reservedWidth).toBe(-10);
    // the preview moves by the rounded amount
    expect(result.adjustedDiff).toBeCloseTo(9.6);
  });
});

test.describe.parallel('group resize', () => {
  test('should do group resize with distributing space by percentage of current space', () => {
    const testData = {
      columnSizing: {},
      availableSize: 400,
      dragHandleOffset: 9,
      dragHandlePositionAfter: 1,
      shareSpaceOnResize: false,
      columnGroupSize: 2,
      reservedWidth: 100,
      items: [
        {
          id: 'first-in-group',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
          resizable: true,
        },
        {
          id: 'second-in-group',
          computedWidth: 200,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
          resizable: true,
        },
        {
          id: 'outside-group',
          computedWidth: 200,
          computedFlex: 0,
          resizable: true,
          computedMaxWidth: 2000,
          computedMinWidth: 0,
        },
      ],
    };

    let result = computeGroupResize(testData);

    expect(result).toMatchObject({
      adjustedDiffs: [3, 6],
      reservedWidth: 91,
      minReached: false,
      constrained: false,
      columnSizing: {
        'first-in-group': {
          width: testData.items[0].computedWidth + 3,
        },
        'second-in-group': {
          width: testData.items[1].computedWidth + 6,
        },
      },
    });
  });

  test('should do group resize but keep unresizable columns as is', () => {
    const testData = {
      columnSizing: {},
      availableSize: 400,
      dragHandleOffset: 9,
      dragHandlePositionAfter: 1,
      shareSpaceOnResize: false,
      columnGroupSize: 2,
      reservedWidth: 100,
      items: [
        {
          id: 'first-in-group',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
          resizable: false,
        },
        {
          id: 'second-in-group',
          computedWidth: 200,
          computedFlex: 0,
          computedMaxWidth: 10_000,
          computedMinWidth: 0,
          resizable: true,
        },
        {
          id: 'outside-group',
          computedWidth: 200,
          computedFlex: 0,
          resizable: true,
          computedMaxWidth: 2000,
          computedMinWidth: 0,
        },
      ],
    };

    let result = computeGroupResize(testData);

    expect(result).toMatchObject({
      adjustedDiffs: [0, 9],
      reservedWidth: 91,
      minReached: false,
      constrained: false,
      columnSizing: {
        'second-in-group': {
          width: testData.items[1].computedWidth + 9,
        },
      },
    });
  });

  test('should do group resize and respect max widths while resize the rest of the columns', () => {
    const testData = {
      columnSizing: {},
      availableSize: 4000,
      dragHandleOffset: 660,
      dragHandlePositionAfter: 3,
      shareSpaceOnResize: false,
      columnGroupSize: 4,
      reservedWidth: 0,

      items: [
        {
          id: '1',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: 130,
          computedMinWidth: 0,
          resizable: true,
        },
        {
          id: '2',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: 130,
          computedMinWidth: 0,
          resizable: true,
        },
        {
          id: '3',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: 2000,
          computedMinWidth: 0,
          resizable: true,
        },
        {
          id: '4',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: 2000,
          computedMinWidth: 0,
          resizable: true,
        },
      ],
    };

    let result = computeGroupResize(testData);

    expect(result).toMatchObject({
      adjustedDiffs: [30, 30, 300, 300],

      minReached: false,
      maxReached: false,
      constrained: false,
      columnSizing: {
        '1': {
          width: testData.items[0].computedWidth + 30,
        },
        '2': {
          width: testData.items[1].computedWidth + 30,
        },
        '3': {
          width: testData.items[2].computedWidth + 300,
        },
        '4': {
          width: testData.items[3].computedWidth + 300,
        },
      },
    });
  });
});
