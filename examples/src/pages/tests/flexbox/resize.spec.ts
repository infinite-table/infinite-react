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
