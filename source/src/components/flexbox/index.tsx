import { RequireAtLeastOne } from '../InfiniteTable/types/Utility';

type FlexItem = {
  size?: number;
  flex?: number;
  maxSize?: number;
  minSize?: number;
};

type FlexItemWithSizeOrFlex = RequireAtLeastOne<FlexItem, 'size' | 'flex'>;

type FlexComputeParams = {
  availableSize: number;
  minSize?: number;
  maxSize?: number;
  items: FlexItemWithSizeOrFlex[];
};

type SizedFlexItem = FlexItem & {
  flexSize?: number;
  computedSize?: number;
};

type FlexComputeResult = {
  items: SizedFlexItem[];
  flexSizes: number[];
  computedSizes: number[];
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

  items.forEach((item, i) => {
    let maxSize = item.maxSize ?? defaultMaxSize ?? undefined;
    let minSize = item.maxSize ?? defaultMinSize ?? undefined;

    if (item.size != null) {
      if (maxSize != null && item.size > maxSize) {
        item.size = maxSize;
      }
      if (minSize != null && item.size < minSize) {
        item.size = minSize;
      }
    }

    if (item.size == null && item.flex == null) {
      throw `Items must specify either a size or a flex property. Item at index ${i} doesn't have either of those.`;
    }

    if (item.flex != null) {
      totalFlexCount += 1;
    }

    totalFlex += item.flex ?? 0;
    totalFixedSize += item.size ?? 0;
  });

  let availableSizeForFlex = Math.max(availableSize - totalFixedSize, 0);
  let sizePerFlex = availableSizeForFlex / totalFlex;

  // now we need another iteration in order to adjust constrained items
  let maxxedFlexItems: { [key: number]: boolean } = {};
  let minnedFlexItems: { [key: number]: boolean } = {};
  let constrainedCount = 0;

  items.forEach((item, index) => {
    if (item.flex != null) {
      const approxFlexSize = sizePerFlex * item.flex;
      let maxSize = item.maxSize ?? defaultMaxSize ?? undefined;
      let minSize = item.maxSize ?? defaultMinSize ?? undefined;

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
    computedSizes,
    remainingSize: Math.round(availableSize - totalTakenSize),
  };
};
