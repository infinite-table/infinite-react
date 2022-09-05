import { Point, PointCoords } from '../Point';
import { Rectangle, RectangleCoords } from '../Rectangle';

type Alignable = RectangleCoords | HTMLElement | DOMRect;

export type AlignPositionEnum =
  | 'TopLeft'
  | 'TopCenter'
  | 'TopRight'
  | 'CenterRight'
  | 'BottomRight'
  | 'BottomCenter'
  | 'BottomLeft'
  | 'CenterLeft'
  | 'Center';

type AlignPositionItem = [AlignPositionEnum, AlignPositionEnum];

type AlignPositionOptions = {
  alignPosition: AlignPositionItem[];
  constrainTo?: Alignable;
  alignAnchor: Alignable;
  alignTarget: Alignable;
};

type AlignPositionResult = {
  alignPosition: AlignPositionItem;
  alignedRect: Rectangle;
  distance: PointCoords;
  valid: boolean;
  index: number;
};

function isHTMLElement(v: Alignable): v is HTMLElement {
  //@ts-ignore
  return !!v.tagName;
}

export function getAlignPosition(
  options: AlignPositionOptions,
): AlignPositionResult {
  const { alignTarget, alignAnchor, constrainTo, alignPosition } = options;

  const alignTargetRectangle = Rectangle.from(
    isHTMLElement(alignTarget)
      ? alignTarget.getBoundingClientRect()
      : alignTarget,
  );

  const alignAnchorRectangle = Rectangle.from(
    isHTMLElement(alignAnchor)
      ? alignAnchor.getBoundingClientRect()
      : alignAnchor,
  );

  const constrainRectangle = constrainTo
    ? Rectangle.from(
        isHTMLElement(constrainTo)
          ? constrainTo.getBoundingClientRect()
          : constrainTo,
      )
    : null;

  if (!constrainRectangle) {
    // no constrain, so the first alignPosition will match
    const alignResult = align({
      anchorRect: alignAnchorRectangle,
      targetRect: alignTargetRectangle,
      position: alignPosition[0],
    });
    return {
      ...alignResult,
      index: 0,
    };
  }

  let firstAlignResult: AlignPositionResult | null = null;

  for (let i = 0, len = alignPosition.length; i < len; i++) {
    const alignResult = align({
      anchorRect: alignAnchorRectangle,
      targetRect: alignTargetRectangle,
      position: alignPosition[i],
      constrainRect: constrainRectangle,
    });
    if (i === 0) {
      firstAlignResult = {
        ...alignResult,
        index: 0,
      };
    }

    if (alignResult.valid) {
      return {
        ...alignResult,

        index: 0,
      };
    }
  }
  return firstAlignResult!;
}

export function align(options: {
  targetRect: Rectangle;
  anchorRect: Rectangle;
  position: AlignPositionItem;
  constrainRect?: Rectangle | null;
}) {
  const targetRect = Rectangle.from(options.targetRect);
  const anchorRect = Rectangle.from(options.anchorRect);
  const constrainRect = options.constrainRect
    ? Rectangle.from(options.constrainRect)
    : null;

  const { position } = options;
  const [targetPos, anchorPos] = position;

  const targetPoint = getRectanglePointForPosition(targetRect, targetPos);
  const anchorPoint = getRectanglePointForPosition(anchorRect, anchorPos);

  const distance = targetPoint.getDistanceToPoint(anchorPoint);

  targetRect.shift(distance);

  const valid = constrainRect ? constrainRect.contains(targetRect) : true;

  return {
    alignPosition: position,
    alignedRect: targetRect,
    valid,
    distance,
  };
}

function getRectanglePointForPosition(
  rect: Rectangle,
  position: AlignPositionEnum,
): Point {
  if (position === 'TopLeft') {
    return Point.from({
      top: rect.top,
      left: rect.left,
    });
  }

  if (position === 'TopCenter') {
    return Point.from({
      top: rect.top,
      left: rect.left + (rect.width > 0 ? Math.round(rect.width / 2) : 0),
    });
  }
  if (position === 'TopRight') {
    return Point.from({
      top: rect.top,
      left: rect.left + rect.width,
    });
  }
  if (position === 'BottomLeft') {
    return Point.from({
      left: rect.left,
      top: rect.top + rect.height,
    });
  }
  if (position === 'BottomCenter') {
    return Point.from({
      left: rect.left + (rect.width > 0 ? Math.round(rect.width / 2) : 0),
      top: rect.top + rect.height,
    });
  }
  if (position === 'BottomRight') {
    return Point.from({
      left: rect.left + rect.width,
      top: rect.top + rect.height,
    });
  }

  if (position === 'CenterLeft') {
    return Point.from({
      left: rect.left,
      top: rect.top + (rect.height > 0 ? Math.round(rect.height / 2) : 0),
    });
  }
  if (position === 'CenterRight') {
    return Point.from({
      left: rect.left + rect.width,
      top: rect.top + (rect.height > 0 ? Math.round(rect.height / 2) : 0),
    });
  }

  // position === AlignPositionEnum.Center
  return Point.from({
    left: rect.left + (rect.width > 0 ? Math.round(rect.width / 2) : 0),
    top: rect.top + (rect.height > 0 ? Math.round(rect.height / 2) : 0),
  });
}

// function align(options: { targetRect: Rectangle; anchorRect: Rectangle }) {

// }

// getAlignPosition({
//   alignPosition: [
//     [AlignPositionEnum.TopLeft, AlignPositionEnum.TopCenter],
//     [AlignPositionEnum.TopLeft, AlignPositionEnum.TopCenter],
//   ],
//   alignAnchor: {
//     top: 0,
//     left: 0,
//     width: 100,
//     height: 100,
//   },

//   alignTarget: {
//     top: 0,
//     left: 0,
//     width: 100,
//     height: 100,
//   },
// });
