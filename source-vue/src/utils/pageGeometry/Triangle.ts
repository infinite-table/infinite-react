import { ConvexPoly } from './ConvexPoly';
import { PointCoords } from './Point';
import { ArrayWith3 } from './types';

type PointCoordsTimes3 = ArrayWith3<PointCoords>;

export class Triangle extends ConvexPoly {
  // uncommenting this here breaks our tests - WHAT????
  // it's just narrowing down the type of the points member variable
  // - this should not introduce any change in behavior!!! however, TS is crazy about this one
  // points!: PointTimes3;

  constructor(points: PointCoordsTimes3) {
    super(points.slice(0, 3) as PointCoordsTimes3);
  }
}
