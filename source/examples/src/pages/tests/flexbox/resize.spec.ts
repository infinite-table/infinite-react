import { test, expect } from '@playwright/test';
import { computeResize } from '@src/components/flexbox';

test.describe.parallel('resize shareSpaceOnResize', () => {
  test('resize with share space should work, when resizing the last item and check maxWidth works', () => {
    const testData = {
      columnSizing: {},
      availableSize: 1000,
      dragHandleOffset: 10,
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 10,
          computedFlex: 0,
          computedMaxWidth: null as number | null,
          computedMinWidth: null as number | null,
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
          computedMaxWidth: null as number | null,
          computedMinWidth: null as number | null,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMaxWidth: null as number | null,
          computedMinWidth: null as number | null,
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
          computedMaxWidth: null as number | null,
          computedMinWidth: null as number | null,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMaxWidth: null as number | null,
          computedMinWidth: 180,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      minReached: true,

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
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: null as number | null,
          computedMinWidth: null as number | null,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: null as number | null,
          computedMaxWidth: 250,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      maxReached: true,
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
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 250,
          computedFlex: 250,
          computedMaxWidth: 300,
          computedMinWidth: null as number | null,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: null as number | null,
          computedMaxWidth: null as number | null,
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
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 250,
          computedFlex: 250,
          computedMinWidth: 200,
          computedMaxWidth: null as number | null,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: null as number | null,
          computedMaxWidth: null as number | null,
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
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 250,
          computedFlex: 250,
          computedMinWidth: 200,
          computedMaxWidth: null as number | null,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: null as number | null,
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
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 250,
          computedFlex: 250,
          computedMaxWidth: 270,
          computedMinWidth: null as number | null,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: 120,
          computedMaxWidth: null as number | null,
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
      dragHandlePositionAfter: 0,
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 250,
          computedFlex: 250,
          computedMinWidth: null as number | null,
          computedMaxWidth: 340,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: 180,
          computedMaxWidth: null as number | null,
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
      shareSpaceOnResize: true,
      items: [
        {
          id: 'a',
          computedWidth: 250,
          computedFlex: 250,
          computedMinWidth: 200,
          computedMaxWidth: null as number | null,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMinWidth: null as number | null,
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
      items: [
        {
          id: 'a',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: null as number | null,
          computedMinWidth: null as number | null,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMaxWidth: null as number | null,
          computedMinWidth: null as number | null,
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

  test('should take reservedWidth into account ', () => {
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
          computedMaxWidth: null as number | null,
          computedMinWidth: null as number | null,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMaxWidth: null as number | null,
          computedMinWidth: null as number | null,
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
      items: [
        {
          id: 'a',
          computedWidth: 100,
          computedFlex: 0,
          computedMaxWidth: null as number | null,
          computedMinWidth: 70,
        },
        {
          id: 'b',
          computedWidth: 200,
          computedFlex: 0,
          computedMaxWidth: 200,
          computedMinWidth: null as number | null,
        },
      ],
    };

    let result = computeResize(testData);

    expect(result).toMatchObject({
      columnSizing: {
        a: {
          width: testData.items[0].computedWidth - 30,
        },
      },
    });
  });
});
