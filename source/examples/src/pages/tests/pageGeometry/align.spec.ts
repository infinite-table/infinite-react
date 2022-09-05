import { test, expect } from '@playwright/test';

import { Rectangle } from '@src/utils/pageGeometry/Rectangle';
import { align, getAlignPosition } from '@src/utils/pageGeometry/alignment';

export default test.describe.parallel('Alignments', () => {
  test('align works', () => {
    const r1 = new Rectangle({
      top: 10,
      left: 10,
      width: 20,
      height: 3,
    });

    const r2 = new Rectangle({
      top: 14,
      left: 25,
      width: 10,
      height: 5,
    });

    let { alignedRect: rect } = align({
      targetRect: r1,
      anchorRect: r2,
      position: ['TopLeft', 'BottomRight'],
    });

    expect(rect).toEqual({
      top: 19,
      left: 35,
      width: 20,
      height: 3,
    });

    let { alignedRect: rect1 } = align({
      targetRect: r1,
      anchorRect: r2,
      position: ['Center', 'CenterLeft'],
    });
    // CenterLeft of r2 is at top: 17, left 25
    // the center of r1 should be at those coords
    // before the alignment, the center was at top 12, left 20

    expect(rect1).toEqual({
      top: 15,
      left: 15,
      width: 20,
      height: 3,
    });
  });

  test('align works with constrain', () => {
    const r1 = new Rectangle({
      top: 10,
      left: 10,
      width: 20,
      height: 20,
    });

    const r2 = new Rectangle({
      top: 20,
      left: 20,
      width: 5,
      height: 5,
    });

    let { alignedRect: rect, valid } = align({
      targetRect: r1,
      anchorRect: r2,
      position: ['TopLeft', 'TopLeft'],
      constrainRect: new Rectangle({
        top: 20,
        left: 20,
        width: 10,
        height: 10,
      }),
    });

    expect(rect).toEqual({
      top: 20,
      left: 20,
      width: 20,
      height: 20,
    });
    expect(valid).toBe(false);

    let { alignedRect: rect1, valid: valid1 } = align({
      targetRect: r1,
      anchorRect: r2,
      position: ['TopLeft', 'TopLeft'],
      constrainRect: new Rectangle({
        top: 20,
        left: 20,
        width: 20,
        height: 20,
      }),
    });

    expect(rect1).toEqual({
      top: 20,
      left: 20,
      width: 20,
      height: 20,
    });
    expect(valid1).toBe(true);
  });

  test('getAlignPosition works with constrain - 1', () => {
    const r1 = new Rectangle({
      top: 0,
      left: 0,
      width: 20,
      height: 20,
    });

    const r2 = new Rectangle({
      top: 10,
      left: 10,
      width: 5,
      height: 5,
    });

    let { valid, alignedRect, alignPosition } = getAlignPosition({
      alignTarget: r1,
      alignAnchor: r2,
      alignPosition: [
        ['TopLeft', 'TopLeft'],
        ['TopRight', 'TopRight'],
        ['BottomLeft', 'TopRight'],
      ],
      constrainTo: new Rectangle({
        top: 20,
        left: 0,
        width: 25,
        height: 25,
      }),
    });

    expect(valid).toBe(false);
    expect(alignPosition).toEqual(['TopLeft', 'TopLeft']);
    expect(alignedRect).toEqual({
      top: 10,
      left: 10,
      width: 20,
      height: 20,
    });
  });

  test('getAlignPosition works with constrain - 2', () => {
    const r1 = new Rectangle({
      top: 0,
      left: 0,
      width: 20,
      height: 20,
    });

    const r2 = new Rectangle({
      top: 10,
      left: 10,
      width: 5,
      height: 5,
    });

    let { valid, alignedRect, alignPosition } = getAlignPosition({
      alignTarget: r1,
      alignAnchor: r2,
      alignPosition: [
        ['TopLeft', 'TopLeft'],
        ['TopRight', 'TopRight'],
        ['BottomLeft', 'TopRight'],
      ],
      constrainTo: new Rectangle({
        top: 10,
        left: -5,
        width: 20,
        height: 20,
      }),
    });

    expect(valid).toBe(true);
    expect(alignPosition).toEqual(['TopRight', 'TopRight']);
    expect(alignedRect).toEqual({
      top: 10,
      left: -5,
      width: 20,
      height: 20,
    });
  });
});
