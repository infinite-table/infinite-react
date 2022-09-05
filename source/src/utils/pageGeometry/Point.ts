export type PointCoords = {
  top: number;
  left: number;
};
export class Point {
  top: PointCoords['top'] = 0;
  left: PointCoords['left'] = 0;

  static clone(point: PointCoords) {
    return new Point(point);
  }

  static from(point: PointCoords) {
    return new Point(point);
  }

  constructor(point: PointCoords) {
    this.left = point.left;
    this.top = point.top;
  }

  shift(
    shiftOptions:
      | { top: number }
      | { top: number; left: number }
      | { left: number },
  ) {
    if ((shiftOptions as { top: number }).top != null) {
      this.top += (shiftOptions as { top: number }).top;
    }
    if ((shiftOptions as { left: number }).left != null) {
      this.left += (shiftOptions as { left: number }).left;
    }
    return this;
  }

  getDistanceToPoint(point: PointCoords) {
    const shiftTop = point.top - this.top;
    const shiftLeft = point.left - this.left;

    return {
      top: shiftTop,
      left: shiftLeft,
    };
  }
}

export const originPoint: PointCoords = {
  left: 0,
  top: 0,
};
