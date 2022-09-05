import { PointCoords } from './Point';
import { polyContainsPoint } from './polyContainsPoint';
import { ArrayWithAtLeast3 } from './types';

export abstract class PolyWithPoints {
  abstract getPoints(): ArrayWithAtLeast3<PointCoords>;

  abstract shift(
    shiftOptions:
      | { top: number }
      | { top: number; left: number }
      | { left: number },
  ): PolyWithPoints;

  containsPoint(point: PointCoords): boolean {
    return polyContainsPoint(this.getPoints(), point);
  }
  contains(poly: PolyWithPoints): boolean {
    const points = poly.getPoints();

    for (let i = 0, len = points.length; i < len; i++) {
      if (!this.containsPoint(points[i])) {
        return false;
      }
    }

    return true;
  }
  intersects(r: PolyWithPoints): boolean {
    return this.privateIntersects(r, false);
  }

  privateIntersects(r: PolyWithPoints, skipOtherCheck: boolean): boolean {
    const pointsOfR = r.getPoints();
    for (let i = 0, len = pointsOfR.length; i < len; i++) {
      if (this.containsPoint(pointsOfR[i])) {
        return true;
      }
    }
    if (skipOtherCheck) {
      return false;
    }
    // there is another case, when we have 2 rectangles, r1, and r2
    // and r2 is fully inside r1 - intersects should treat this case as well

    // calling r2.intersects(r1) should return true
    // but the above is not enough for this

    // so we execute the reverse as well
    return r.privateIntersects(this, true);
  }
}
