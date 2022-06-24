import { InfiniteTableComputedColumn } from '../InfiniteTable';
import { InfiniteTablePropColumnSizing } from '../InfiniteTable/types/InfiniteTableProps';
import { RequireAtLeastOne } from '../InfiniteTable/types/Utility';

type FlexItem = {
  size?: number | null;
  flex?: number | null;
  maxSize?: number | null;
  minSize?: number | null;
};

type FlexItemWithSizeOrFlex = RequireAtLeastOne<FlexItem, 'size' | 'flex'>;

type FlexComputeParams = {
  availableSize: number;
  minSize?: number;
  maxSize?: number;
  items: FlexItemWithSizeOrFlex[];
  computeSpecialSpaceDistribution?: boolean;
};

type SizedFlexItem = FlexItem & {
  flexSize?: number;
  computedSize?: number;
};

type FlexComputeResult = {
  items: SizedFlexItem[];
  flexSizes: number[];
  computedSizes: number[];
  minSizes: (number | undefined)[];
  maxSizes: (number | undefined)[];
  remainingSize: number;
};

export const computeFlex = (params: FlexComputeParams): FlexComputeResult => {
  const {
    availableSize,
    items,
    minSize: defaultMinSize,
    maxSize: defaultMaxSize,
  } = params;

  if (availableSize < 0) {
    throw 'The provided availableSize cannot be negative!';
  }

  let totalFixedSize = 0;
  let totalFlex = 0;
  let totalFlexCount = 0;

  const minSizes: (number | undefined)[] = [];
  const maxSizes: (number | undefined)[] = [];

  items.forEach((item, i) => {
    let maxSize = item.maxSize ?? defaultMaxSize ?? undefined;
    let minSize = item.minSize ?? defaultMinSize ?? undefined;

    minSizes.push(minSize);
    maxSizes.push(maxSize);

    if (item.size != null) {
      if (maxSize != null && item.size > maxSize) {
        item.size = maxSize;
      }
      if (minSize != null && item.size < minSize) {
        item.size = minSize;
      }
    }

    const itemFlex = item.flex == 0 ? null : item.flex;

    if (item.size == null && itemFlex == null) {
      throw `Items must specify either a size or a flex property. Item at index ${i} doesn't have either of those.`;
    }

    if (itemFlex != null) {
      totalFlexCount += 1;
    }

    totalFlex += itemFlex ?? 0;
    totalFixedSize += item.size ?? 0;
  });

  let availableSizeForFlex = params.computeSpecialSpaceDistribution
    ? Math.max(availableSize, 0)
    : Math.max(availableSize - totalFixedSize, 0);
  let sizePerFlex = availableSizeForFlex / totalFlex;

  // now we need another iteration in order to adjust constrained items
  let maxxedFlexItems: { [key: number]: boolean } = {};
  let minnedFlexItems: { [key: number]: boolean } = {};
  let constrainedCount = 0;

  items.forEach((item, index) => {
    if (item.flex != null) {
      const approxFlexSize = sizePerFlex * item.flex;
      let maxSize = item.maxSize ?? defaultMaxSize ?? undefined;
      let minSize = item.minSize ?? defaultMinSize ?? undefined;

      let constrained: boolean = false;
      let substractSize = 0;

      if (maxSize != null && approxFlexSize > maxSize) {
        maxxedFlexItems[index] = true;
        constrained = true;
        substractSize = maxSize;
      }

      if (minSize != null && approxFlexSize < minSize) {
        minnedFlexItems[index] = true;
        constrained = true;
        substractSize = minSize;
      }

      if (constrained) {
        constrainedCount += 1;
        // no longer will be considered a flex item
        // so substract it from the count
        totalFlexCount -= 1;
        totalFlex -= item.flex;
        availableSizeForFlex -= substractSize;
      }
    }
  });

  // adjust those calculations we did previously
  if (constrainedCount) {
    sizePerFlex = availableSizeForFlex / totalFlex;
  }

  let flexSizes: number[] = [];
  let currentFlexCount = 0;
  let remainingSizeForFlex = availableSizeForFlex;
  let remainingFlex = totalFlex;

  let totalTakenSize = 0;

  let flexSizeSum = 0;

  const computedSizes: number[] = [];

  const resultItems: SizedFlexItem[] = items.map((item, index) => {
    const sizedItem: SizedFlexItem = { ...item };

    let maxSize = item.maxSize ?? defaultMaxSize ?? undefined;
    let minSize = item.minSize ?? defaultMinSize ?? undefined;

    let flexSize = 0;
    const maxxed = maxxedFlexItems[index];
    const minned = minnedFlexItems[index];
    const constrained = maxxed || minned;

    let computedSize = item.size ?? 0;

    if (item.flex != null) {
      if (constrained) {
        if (minned) {
          flexSize = minSize!;
        }
        if (maxxed) {
          flexSize = maxSize!;
        }
      } else {
        currentFlexCount += 1;

        const constrain = (size: number) => {
          if (maxSize != null && size > maxSize) {
            size = maxSize;
          }
          if (minSize != null && size < minSize) {
            size = minSize;
          }

          return size;
        };

        if (currentFlexCount === totalFlexCount) {
          flexSize = constrain(remainingSizeForFlex);
        } else {
          flexSize = constrain(Math.round(item.flex * sizePerFlex));

          flexSizeSum += flexSize;
          remainingSizeForFlex = availableSizeForFlex - flexSizeSum;
          remainingFlex -= item.flex;

          sizePerFlex = remainingSizeForFlex / remainingFlex;
        }
      }

      computedSize = flexSize;
      sizedItem.flexSize = flexSize;
    }

    flexSizes.push(flexSize);

    computedSizes.push(computedSize);

    sizedItem.computedSize = computedSize;

    totalTakenSize += computedSize;

    return sizedItem;
  });

  return {
    items: resultItems,
    flexSizes,
    minSizes,
    maxSizes,
    computedSizes,
    remainingSize: Math.round(availableSize - totalTakenSize),
  };
};

type FlexComputeResizeItem = {
  id: InfiniteTableComputedColumn<any>['id'];
  computedWidth: InfiniteTableComputedColumn<any>['computedWidth'];
  computedFlex: InfiniteTableComputedColumn<any>['computedFlex'];
  computedMinWidth: InfiniteTableComputedColumn<any>['computedMinWidth'];
  computedMaxWidth: InfiniteTableComputedColumn<any>['computedMaxWidth'];
};
type FlexComputeResizeParams = {
  items: FlexComputeResizeItem[];
  columnSizing: InfiniteTablePropColumnSizing;
  availableSize: number;
  reservedWidth: number;
  dragHandlePositionAfter: number;
  dragHandleOffset: number;
  shareSpaceOnResize: boolean;
};

type FlexComputeGroupResizeParams = Omit<
  FlexComputeResizeParams,
  'shareSpaceOnResize' | 'items'
> & {
  columnGroupSize: number;
  items: (FlexComputeResizeItem & { resizable: boolean })[];
};

export type FlexComputeResizeResult = {
  reservedWidth: number;
  adjustedDiff: number;
  maxReached: boolean;
  minReached: boolean;
  constrained: boolean;
  columnSizing: InfiniteTablePropColumnSizing;
};

export type FlexComputeGroupResizeResult = {
  reservedWidth: number;
  adjustedDiffs: number[];
  adjustedDiff: number;
  maxReached: boolean;
  minReached: boolean;
  constrained: boolean;
  columnSizing: InfiniteTablePropColumnSizing;
};

function resizeClamp(
  value: number,
  min: number | null,
  max: number | null,
  direction: 1 | -1,
): { value: number; clamped: 'min' | 'max' | false; diff: number } {
  if (min != null && value <= min) {
    return { value: min, clamped: 'min', diff: (value - min) * direction };
  }
  if (max != null && value >= max) {
    return { value: max, clamped: 'max', diff: (max - value) * direction };
  }
  return { value, clamped: false, diff: 0 };
}

export const computeResize = (
  params: FlexComputeResizeParams,
): FlexComputeResizeResult => {
  const { availableSize, reservedWidth = 0 } = params;

  const columnSizing: InfiniteTablePropColumnSizing = Object.keys(
    params.columnSizing,
  ).reduce((acc, key) => {
    acc[key] = { ...params.columnSizing[key] };
    return acc;
  }, {} as InfiniteTablePropColumnSizing);

  if (availableSize < 0) {
    throw 'The provided availableSize cannot be negative!';
  }

  let dragHandleOffset = params.dragHandleOffset;

  const firstIndex = params.dragHandlePositionAfter;
  const secondIndex = params.dragHandlePositionAfter + 1;

  const firstItem = params.items[firstIndex];
  const secondItem: FlexComputeResizeItem | undefined =
    params.items[secondIndex];

  const firstId = firstItem.id;
  const secondId = secondItem?.id;

  // the computed width holds the actual size
  const firstSize = firstItem.computedWidth;
  const firstMinSize = firstItem.computedMinWidth;
  const firstMaxSize = firstItem.computedMaxWidth;
  // even though if flex is present, we use it to determine which property to put in the result
  const firstPropertyToAdjust = firstItem.computedFlex ? 'flex' : 'width';

  const secondSize = secondItem?.computedWidth;
  const secondMinSize = secondItem?.computedMinWidth;
  const secondMaxSize = secondItem?.computedMaxWidth;
  const secondPropertyToAdjust = secondItem?.computedFlex ? 'flex' : 'width';

  let maxReached = false;
  let minReached = false;

  const direction = dragHandleOffset > 0 ? 1 : -1;

  let {
    value: firstAdjustedSize,
    clamped: firstClamped,
    diff: firstDiff,
  } = resizeClamp(
    firstSize + dragHandleOffset,
    firstMinSize,
    firstMaxSize,
    direction,
  );

  if (params.shareSpaceOnResize) {
    // there's no item on the right side of the handle
    if (secondItem == null) {
      columnSizing[firstId] = {
        ...columnSizing[firstId],
        [firstPropertyToAdjust]: firstAdjustedSize,
      };

      minReached = firstClamped === 'min';
      maxReached = firstClamped === 'max';

      const adjustedDiff = firstAdjustedSize - firstSize;
      return {
        adjustedDiff,
        reservedWidth,
        columnSizing,
        minReached,
        maxReached,
        constrained: minReached || maxReached,
      };
    }
    let {
      value: secondAdjustedSize,
      clamped: secondClamped,
      diff: secondDiff,
    } = resizeClamp(
      secondSize - dragHandleOffset,
      secondMinSize,
      secondMaxSize,
      direction,
    );

    if (firstClamped && secondClamped) {
      // both are clamped, so decide which one to take
      // take the one with the greater diff
      if (Math.abs(firstDiff) > Math.abs(secondDiff)) {
        // first is smaller, so make second not clamped
        secondClamped = false;
      } else {
        // second is smaller, so make first not clamped
        firstClamped = false;
      }
    }

    if (!firstClamped && !secondClamped) {
      //this is the happy case, so all good
    } else if (firstClamped) {
      const clampResultForSecond = resizeClamp(
        secondSize - dragHandleOffset - firstDiff,
        secondMinSize,
        secondMaxSize,
        direction,
      );
      secondAdjustedSize = clampResultForSecond.value;
      secondClamped = clampResultForSecond.clamped;
      secondDiff = clampResultForSecond.diff;
    } else if (secondClamped) {
      const clampResultForFirst = resizeClamp(
        firstSize + dragHandleOffset + secondDiff,
        firstMinSize,
        firstMaxSize,
        direction,
      );
      firstAdjustedSize = clampResultForFirst.value;
      firstClamped = clampResultForFirst.clamped;
      firstDiff = clampResultForFirst.diff;
    }

    columnSizing[firstId] = {
      ...columnSizing[firstId],
      [firstPropertyToAdjust]: firstAdjustedSize,
    };
    columnSizing[secondId] = {
      ...columnSizing[secondId],
      [secondPropertyToAdjust]: secondAdjustedSize,
    };

    minReached = firstClamped === 'min' || secondClamped === 'min';
    maxReached = firstClamped === 'max' || secondClamped === 'max';
  } else {
    columnSizing[firstId] = {
      ...columnSizing[firstId],
      [firstPropertyToAdjust]: firstAdjustedSize,
    };

    minReached = firstClamped === 'min';
    maxReached = firstClamped === 'max';
  }

  const adjustedDiff = firstAdjustedSize - firstSize;
  return {
    adjustedDiff,
    reservedWidth: !params.shareSpaceOnResize
      ? reservedWidth - adjustedDiff
      : reservedWidth,
    columnSizing,
    minReached,
    maxReached,
    constrained: minReached || maxReached,
  };
};

function sum(a: number, b: number) {
  return a + b;
}

function cloneColumnSizing(columnSizing: InfiniteTablePropColumnSizing) {
  const newColumnSizing: InfiniteTablePropColumnSizing = Object.keys(
    columnSizing,
  ).reduce((acc, key) => {
    acc[key] = { ...columnSizing[key] };
    return acc;
  }, {} as InfiniteTablePropColumnSizing);

  return newColumnSizing;
}
export const computeGroupResize = (
  params: FlexComputeGroupResizeParams,
): FlexComputeGroupResizeResult => {
  const { availableSize, reservedWidth = 0 } = params;

  const columnSizing: InfiniteTablePropColumnSizing = Object.keys(
    params.columnSizing,
  ).reduce((acc, key) => {
    acc[key] = { ...params.columnSizing[key] };
    return acc;
  }, {} as InfiniteTablePropColumnSizing);

  if (availableSize < 0) {
    throw 'The provided availableSize cannot be negative!';
  }

  let dragHandleOffset = params.dragHandleOffset;

  const beforeIndexes = [...new Array(params.columnGroupSize)]
    .map((_, index) => params.dragHandlePositionAfter - index)
    .reverse();

  const beforeItems = beforeIndexes.map((i) => params.items[i]);

  // the computed width holds the actual size
  const beforeSizes = beforeItems.map((item) => item.computedWidth);

  // even though if flex is present, we use it to determine which property to put in the result
  const beforePropertiesToAdjust = beforeItems.map((item) =>
    item.computedFlex ? 'flex' : 'width',
  );

  let unresizableWidth = 0;
  const { computedSizes } = computeFlex({
    items: beforeItems.map((item) => {
      if (item.resizable === false) {
        unresizableWidth += item.computedWidth;
      }
      return {
        maxSize: item.computedMaxWidth,
        minSize: item.computedMinWidth,
        flex: item.resizable ? item.computedWidth : null,
        size: 0,
      };
    }),
    computeSpecialSpaceDistribution: true,
    availableSize: Math.max(
      beforeSizes.reduce(sum, 0) + dragHandleOffset - unresizableWidth,
      0,
    ),
  });

  const diffsForEachItem = beforeItems.map((item, index) => {
    return computedSizes[index] - item.computedWidth;
  });

  let groupMinReached = true;
  let groupMaxReached = true;
  let groupConstrained = true;

  const adjustedDiffs: number[] = [];

  diffsForEachItem.forEach((diff, i) => {
    const item = beforeItems[i];

    if (!item.resizable) {
      adjustedDiffs.push(0);
      return;
    }
    const propertyToAdjust = beforePropertiesToAdjust[i];
    const itemSize = beforeSizes[i];

    const currentColumnSizing = cloneColumnSizing(columnSizing);
    const { maxReached, minReached, constrained, adjustedDiff } = computeResize(
      {
        availableSize: params.availableSize,
        reservedWidth: params.reservedWidth,
        dragHandleOffset: diff,
        // doesn't matter for share space on resize: false
        dragHandlePositionAfter: beforeIndexes[i],
        shareSpaceOnResize: false,
        items: params.items,
        columnSizing: currentColumnSizing,
      },
    );

    columnSizing[item.id] = {
      ...currentColumnSizing[item.id],
      [propertyToAdjust]: itemSize + adjustedDiff,
    };

    adjustedDiffs.push(adjustedDiff);

    if (!maxReached) {
      groupMaxReached = false;
    }
    if (!minReached) {
      groupMinReached = false;
    }
    if (!constrained) {
      groupConstrained = false;
    }
  });

  const adjustedDiff = adjustedDiffs.reduce(sum, 0);

  return {
    minReached: groupMinReached,
    maxReached: groupMaxReached,
    constrained: groupConstrained,
    adjustedDiffs,
    adjustedDiff,
    columnSizing,
    reservedWidth: reservedWidth - adjustedDiff,
  };
};
