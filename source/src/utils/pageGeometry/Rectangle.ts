import { ConvexPoly } from './ConvexPoly';
import { Point, PointCoords } from './Point';
import { PolyWithPoints } from './PolyWithPoints';

type CoordsWithSize = {
  width: number;
  height: number;
  left: number;
  top: number;
};
type CoordsNoSize = {
  right: number;
  bottom: number;
  left: number;
  top: number;
};

export type RectangleCoords = CoordsWithSize | CoordsNoSize;
export class Rectangle extends PolyWithPoints {
  top: number = 0;
  left: number = 0;

  width: number = 0;
  height: number = 0;

  static fromDOMRect(rect: DOMRect) {
    return new Rectangle(rect);
  }

  static clone(rect: DOMRect | Rectangle | RectangleCoords) {
    return new Rectangle(rect);
  }

  static from(rect: DOMRect | Rectangle | RectangleCoords) {
    return Rectangle.clone(rect);
  }

  constructor(coordsAndSize: RectangleCoords) {
    super();
    this.top = coordsAndSize.top;
    this.left = coordsAndSize.left;

    if (typeof (coordsAndSize as CoordsWithSize).width === 'number') {
      this.width = (coordsAndSize as CoordsWithSize).width;
      this.height = (coordsAndSize as CoordsWithSize).height;
    } else {
      this.width = (coordsAndSize as CoordsNoSize).right - coordsAndSize.left;
      this.height = (coordsAndSize as CoordsNoSize).bottom - coordsAndSize.top;
    }
  }

  containsPoint(p: PointCoords) {
    return new ConvexPoly(this.getPoints()).containsPoint(p);
  }

  getPoints() {
    return [
      { left: this.left, top: this.top },
      { left: this.left, top: this.top + this.height },
      { left: this.left + this.width, top: this.top + this.height },
      { left: this.left + this.width, top: this.top },
    ].map(Point.from) as [Point, Point, Point, Point];
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
}
