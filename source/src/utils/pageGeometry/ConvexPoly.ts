import { Point, PointCoords } from './Point';

import { PolyWithPoints } from './PolyWithPoints';
import { ArrayWithAtLeast3 } from './types';

export class ConvexPoly extends PolyWithPoints {
  points!: ArrayWithAtLeast3<Point>;

  static clone(points: ArrayWithAtLeast3<PointCoords>) {
    return new ConvexPoly(points);
  }

  constructor(points: ArrayWithAtLeast3<PointCoords>) {
    super();
    this.points = points.map(Point.clone) as ArrayWithAtLeast3<Point>;
  }

  getPoints() {
    return this.points as ArrayWithAtLeast3<PointCoords>;
  }

  shift(
    shiftOptions:
      | { top: number }
      | { top: number; left: number }
      | { left: number },
  ) {
    this.points.forEach((p) => {
      p.shift(shiftOptions);
    });

    return this;
  }
}
