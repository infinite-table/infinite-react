import { PointCoords } from './Point';
import { ArrayWith3, ArrayWithAtLeast3 } from './types';

export function polyContainsPoint(
  points: ArrayWithAtLeast3<PointCoords>,
  point: PointCoords,
): boolean {
  const rootPoint = points[0];

  for (
    let i = 1, len = points.length - 1 /*yes, -1 is correct*/;
    i < len;
    i++
  ) {
    const p1 = points[i];
    const p2 = points[i + 1];

    if (triangleContainsPoint([rootPoint, p1, p2], point)) {
      return true;
    }
  }

  return false;
}

// function translateIntoPositive(points: PointCoords[]): PointCoords[] {
//   if (!points.length) {
//     return [];
//   }

//   let minLeft = points[0].left;
//   let minTop = points[0].top;

//   for (let i = 1, len = points.length; i < len; i++) {
//     minLeft = Math.min(minLeft, points[i].left);
//     minTop = Math.min(minTop, points[i].top);
//   }

//   const translateLeft = minLeft < 0;
//   const translateTop = minTop < 0;

//   if (!translateLeft && !translateTop) {
//     // no need to translate points
//     return points;
//   }

//   const result = points.map((p) => {
//     const newPoint = { ...p };
//     if (translateLeft) {
//       newPoint.left = p.left - minLeft;
//     }
//     if (translateTop) {
//       newPoint.top = p.top - minTop;
//     }
//     return newPoint;
//   });

//   return result;
// }

export function triangleContainsPoint(
  points: ArrayWith3<PointCoords>,
  point: PointCoords,
): boolean {
  // const [a, b, c, p] = translateIntoPositive([...points, point]);
  const [a, b, c] = points;
  const p = point;

  // const s1 = c.top - a.top;
  // const s2 = c.left - a.left;
  // const s3 = b.top - a.top;
  // const s4 = p.top - a.top;

  // const w1 =
  //   (a.left * s1 + s4 * s2 - p.left * s1) / (s3 * s2 - (b.left - a.left) * s1);
  // const w2 = (s4 - w1 * s3) / s1;

  // return w1 >= 0 && w2 >= 0 && w1 + w2 <= 1;

  // second try
  let det =
    (b.left - a.left) * (c.top - a.top) - (b.top - a.top) * (c.left - a.left);

  return (
    det *
      ((b.left - a.left) * (p.top - a.top) -
        (b.top - a.top) * (p.left - a.left)) >=
      0 &&
    det *
      ((c.left - b.left) * (p.top - b.top) -
        (c.top - b.top) * (p.left - b.left)) >=
      0 &&
    det *
      ((a.left - c.left) * (p.top - c.top) -
        (a.top - c.top) * (p.left - c.left)) >=
      0
  );

  // var cx = p.left,
  //   cy = p.top,
  //   v0x = c.left - a.left,
  //   v0y = c.top - a.top,
  //   v1x = b.left - a.left,
  //   v1y = b.top - a.top,
  //   v2x = cx - a.left,
  //   v2y = cy - a.top,
  //   dot00 = v0x * v0x + v0y * v0y,
  //   dot01 = v0x * v1x + v0y * v1y,
  //   dot02 = v0x * v2x + v0y * v2y,
  //   dot11 = v1x * v1x + v1y * v1y,
  //   dot12 = v1x * v2x + v1y * v2y;

  // // Compute barycentric coordinates
  // var bary = dot00 * dot11 - dot01 * dot01,
  //   inv = bary === 0 ? 0 : 1 / bary,
  //   u = (dot11 * dot02 - dot01 * dot12) * inv,
  //   v = (dot00 * dot12 - dot01 * dot02) * inv;
  // return u >= 0 && v >= 0 && u + v < 1;
}
