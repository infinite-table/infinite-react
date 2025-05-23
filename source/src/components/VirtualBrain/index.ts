import binarySearch from 'binary-search';
import { Logger } from '../../utils/debugLoggers';
import type { Size } from '../types/Size';

import type { OnScrollFn, ScrollPosition } from '../types/ScrollPosition';

type MainAxisOptions = 'vertical' | 'horizontal';

const initialScrollPosition = {
  scrollLeft: 0,
  scrollTop: 0,
};

const raf =
  typeof window !== 'undefined'
    ? requestAnimationFrame
    : (fn: () => void) => setTimeout(fn, 0);

export type VirtualBrainOptions = {
  mainAxis: MainAxisOptions;
  itemSize: MainAxisSize;

  itemSpan?: ({ itemIndex }: { itemIndex: number }) => number;

  count: number;
  name?: string;
};

const ItemIndexBag = Object.seal({ itemIndex: 0 });

export type MainAxisSize = number | ((itemIndex: number) => number);
type BrainCache = number[];
type OnRenderCountChangeFn = (renderCount: number) => void;
type OnSizeChangeFn = (size: number) => void;
type OnDestroyFn = () => void;

export type GetItemPositionFn = (itemIndex: number) => number;

export type RenderRange = {
  renderStartIndex: number;
  renderEndIndex: number;
};
export type OnRenderRangeChangeFn = (renderRange: RenderRange) => void;

const SORT_ASC = (a: number, b: number) => a - b;

export class VirtualBrain extends Logger {
  private scrollPosition: ScrollPosition = initialScrollPosition;
  private scrollPositionOnMainAxis: number = 0;

  private itemSpanParent!: BrainCache;
  private itemSpanValue!: BrainCache;
  private itemSizeCache!: BrainCache;
  private itemOffsetCache!: BrainCache;
  private options!: VirtualBrainOptions;

  private destroyed: boolean = false;

  private totalSize: number = 0;

  private onScrollFns: OnScrollFn[] = [];
  private onTotalSizeChangeFns: OnSizeChangeFn[] = [];
  private onRenderCountChangeFns: OnRenderCountChangeFn[] = [];
  private onRenderRangeChangeFns: OnRenderRangeChangeFn[] = [];
  private onDestroyFns: OnDestroyFn[] = [];

  name: string | undefined;

  private renderCount: number = 0;
  private renderRange: RenderRange = {
    renderStartIndex: -1,
    renderEndIndex: -1,
  };
  private availableSize: Size = { width: 0, height: 0 };

  constructor(options: VirtualBrainOptions) {
    super(`${options.name}:VirtualBrain:${options.mainAxis}`);

    this.options = options;

    this.reset();

    this.renderCount = 0;

    this.debug(`Init ${options.mainAxis}`);
  }

  public setAvailableSize = (size: Size) => {
    this.availableSize = size;
    if (__DEV__) {
      this.debug(
        'New available size %d',
        size[this.options.mainAxis === 'vertical' ? 'height' : 'width'],
      );
    }

    this.updateRenderCount();
  };

  getOptions() {
    return this.options;
  }

  private updateRenderCount(renderCount?: number) {
    const { itemSize, mainAxis, count } = this.options;
    const size =
      this.availableSize[mainAxis === 'vertical' ? 'height' : 'width'];

    if (!size) {
      this.setRenderCount(0);
      return;
    }

    this.setRenderCount(
      renderCount ?? this.computeRenderCount({ itemSize, count, size }),
    );
  }

  private computeRenderCount = ({
    itemSize,
    count,
    size,
  }: {
    itemSize: MainAxisSize;
    count: number;
    size: number;
  }) => {
    let renderCount = 0;
    if (typeof itemSize === 'function') {
      const sizes = [];
      for (let i = 0; i < count; i++) {
        sizes.push(this.getItemSize(i));
      }
      sizes.sort(SORT_ASC);
      let sum = 0;
      for (let i = 0; i < count; i++) {
        sum += sizes[i];

        renderCount++;
        if (sum > size) {
          break;
        }
      }
      renderCount += 1;
    } else {
      renderCount = Math.ceil(size / itemSize) + 1;
    }

    renderCount = Math.min(count, renderCount);

    return renderCount;
  };

  private setRenderCount = (renderCount: number) => {
    if (renderCount === this.renderCount) {
      this.notifyTotalSizeChange();
      return;
    }

    if (__DEV__) {
      this.debug('set renderCount to %d', renderCount);
    }
    this.renderCount = renderCount;

    this.updateRenderRange();

    this.notifyRenderCountChange();
    this.notifyTotalSizeChange();
  };

  private updateRenderRange() {
    this.setRenderRange(this.computeRenderRange());
  }

  public getRenderStartIndex() {
    return this.renderRange.renderStartIndex;
  }

  public getRenderCount = () => {
    return this.renderCount ?? 0;
  };

  public setScrollPosition = (scrollPosition: ScrollPosition) => {
    this.scrollPosition = scrollPosition;

    const oldScrollPosOnMainAxis = this.scrollPositionOnMainAxis;

    this.scrollPositionOnMainAxis =
      this.scrollPosition[
        this.options.mainAxis === 'vertical' ? 'scrollTop' : 'scrollLeft'
      ];

    if (this.scrollPositionOnMainAxis !== oldScrollPosOnMainAxis) {
      this.updateRenderRange();
    }
    this.notifyScrollChange();
  };

  private notifyScrollChange() {
    const { scrollPosition } = this;

    const fns = this.onScrollFns;
    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i](scrollPosition);
    }
  }

  private notifyDestroy() {
    const fns = this.onDestroyFns;
    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i]();
    }
  }

  private notifyTotalSizeChange() {
    const totalSize = this.getTotalSize();

    const fns = this.onTotalSizeChangeFns;
    for (let i = 0, len = fns.length; i < len; i++) {
      raf(() => {
        fns[i](totalSize);
      });
    }
  }

  private notifyRenderCountChange() {
    const { renderCount } = this;

    const fns = this.onRenderCountChangeFns;
    for (let i = 0, len = fns.length; i < len; i++) {
      raf(() => {
        fns[i](renderCount);
      });
    }
  }

  private notifyRenderRangeChange() {
    const { renderRange } = this;

    const fns = this.onRenderRangeChangeFns;

    for (let i = 0, len = fns.length; i < len; i++) {
      raf(() => {
        fns[i](renderRange);
      });
    }
  }

  public getRenderRange = (): RenderRange => {
    return this.renderRange;
  };

  private setRenderRange(renderRange: RenderRange) {
    const { renderStartIndex, renderEndIndex } = this.renderRange;

    if (
      renderEndIndex !== renderRange.renderEndIndex ||
      renderStartIndex !== renderRange.renderStartIndex
    ) {
      this.renderRange = renderRange;
      if (__DEV__) {
        this.debug(
          'Set renderRange to %d-%d',
          renderRange.renderStartIndex,
          renderRange.renderEndIndex,
        );
      }

      this.notifyRenderRangeChange();
    }
  }

  private computeRenderRange(): RenderRange {
    const count = this.getOptions().count;
    let renderCount = this.getRenderCount();

    if (renderCount === 0) {
      return {
        renderStartIndex: -1,
        renderEndIndex: -1,
      };
    }

    let renderStartIndex = this.getItemAt(this.scrollPositionOnMainAxis);
    let renderEndIndex = renderStartIndex + this.renderCount - 1;

    if (renderEndIndex >= count) {
      renderEndIndex = count - 1;
      renderStartIndex = renderEndIndex - renderCount + 1;
    }

    //TODO we can avoid doing this expand here
    // if the renderStartIndex row is spanned over, we only need to render the span parent instead
    // of the current row - so big wins
    if (this.options.itemSpan) {
      this.computeItemSpanUpTo(renderStartIndex);

      while (this.itemSpanParent[renderStartIndex] != renderStartIndex) {
        renderStartIndex--;
      }
    }

    return {
      renderStartIndex,
      renderEndIndex,
    };
  }

  public getScrollPosition = () => {
    return this.scrollPosition;
  };

  public onScroll = (fn: OnScrollFn) => {
    this.onScrollFns.push(fn);
    return () => {
      this.onScrollFns = this.onScrollFns.filter((f) => f !== fn);
    };
  };

  public onTotalSizeChange = (fn: OnSizeChangeFn) => {
    this.onTotalSizeChangeFns.push(fn);
    return () => {
      this.onTotalSizeChangeFns = this.onTotalSizeChangeFns.filter(
        (f) => f !== fn,
      );
    };
  };
  public onRenderCountChange = (fn: OnRenderCountChangeFn) => {
    this.onRenderCountChangeFns.push(fn);
    return () => {
      this.onRenderCountChangeFns = this.onRenderCountChangeFns.filter(
        (f) => f !== fn,
      );
    };
  };
  public onRenderRangeChange = (fn: OnRenderRangeChangeFn) => {
    this.onRenderRangeChangeFns.push(fn);

    return () => {
      this.onRenderRangeChangeFns = this.onRenderRangeChangeFns.filter(
        (f) => f !== fn,
      );
    };
  };

  public onDestroy = (fn: OnDestroyFn) => {
    this.onDestroyFns.push(fn);

    return () => {
      this.onDestroyFns = this.onDestroyFns.filter((f) => f !== fn);
    };
  };

  public update = (
    newCount: VirtualBrainOptions['count'],
    newItemSize: VirtualBrainOptions['itemSize'],
    newItemSpan?: VirtualBrainOptions['itemSpan'],
  ) => {
    const { itemSize, count, itemSpan } = this.options;

    const countChange = count !== newCount;
    const itemSizeChange = itemSize !== newItemSize;
    const itemSpanChange = itemSpan !== newItemSpan;

    if (!countChange && !itemSizeChange && !itemSpanChange) {
      // this.debug(
      //   `Range (count=${count}, itemSize=${
      //     typeof itemSize === 'number' ? itemSize : 'fn'
      //   }) has not changed, so skip update`,
      // );

      return;
    }

    // this.debug(
    //   `Range changed (count=${newCount}, itemSize=${
    //     typeof newItemSize === 'number' ? newItemSize : 'fn'
    //   }), so update`,
    // );

    this.options.count = newCount;
    this.options.itemSize = newItemSize;
    this.options.itemSpan = newItemSpan;

    const size =
      this.availableSize[
        this.options.mainAxis === 'vertical' ? 'height' : 'width'
      ];

    const newRenderCount = this.computeRenderCount({
      itemSize: newItemSize,
      count: newCount,
      size,
    });

    //TODO this can be optimized even further
    //  since when just count changes, even if it's smaller, the cache should be kept
    if (!itemSizeChange && !itemSpanChange && countChange && newCount > count) {
      const currentRenderCount = this.getRenderCount();

      // no need to continue, since just the count grew - with the exception when the render count was zero before
      if (currentRenderCount > newRenderCount) {
        return;
      }
    }

    if (__DEV__) {
      if (itemSizeChange && countChange) {
        this.debug(
          `Reset brain: reason itemSize changed and count changed (old ${count}, new ${newCount})`,
          {
            oldItemSize: itemSize,
            newItemSize,
          },
        );
      } else if (itemSizeChange) {
        this.debug(`Reset brain: reason itemSize changed`, {
          oldItemSize: itemSize,
          newItemSize,
        });
      } else if (countChange) {
        this.debug(
          `Reset brain: reason count changed (old ${count}, new ${newCount})`,
        );
      }
    }

    this.reset();

    this.updateRenderCount(newRenderCount);
  };

  private reset = () => {
    this.itemSpanParent = [];
    this.itemSpanValue = [];
    this.itemSizeCache = [];
    this.itemOffsetCache = [0];
    this.renderCount = -1;
    this.totalSize = 0;
  };

  private computeItemSpanUpTo = (itemIndex: number) => {
    const { count, itemSpan } = this.options;

    if (!itemSpan) {
      return;
    }

    const cache = this.itemSpanParent;
    const spanResultArr = this.itemSpanValue;

    if (cache[itemIndex] === undefined) {
      let i = cache.length;
      let lastIndex = Math.min(itemIndex, count - 1);

      for (; i <= lastIndex; i++) {
        if (cache[i] === undefined) {
          ItemIndexBag.itemIndex = i;
          let spanValue = itemSpan(ItemIndexBag);

          if (__DEV__ && spanValue < 1) {
            this.debug(
              'itemSpan cannot be less than 1 - got %d for index %d',
              spanValue,
              i,
            );
          }
          // this is it's own span parent
          cache[i] = i;
          spanResultArr[i] = spanValue;

          let spannedItemIndex: number = i;
          while (spanValue > 1) {
            spannedItemIndex += 1;
            cache[spannedItemIndex] = i;
            spanResultArr[spannedItemIndex] = 0;

            spanValue -= 1;
          }
        }
      }
      // spanParent = this.getItemSizeCacheFor(itemIndex);
    }
  };

  private computeCacheFor = (itemIndex: number) => {
    if (typeof this.options.itemSize !== 'function') {
      return;
    }

    const itemSize: number = this.options.itemSize(itemIndex);
    this.itemSizeCache[itemIndex] = itemSize;

    if (itemIndex > 0) {
      const prevOffset = this.itemOffsetCache[itemIndex - 1];
      const prevSize = this.itemSizeCache[itemIndex - 1];
      if (prevOffset == null) {
        console.error(`Offset was not available for item ${itemIndex - 1}`);
      }
      if (prevSize == null) {
        console.error(`Size was not available for item ${itemIndex - 1}`);
      }
      const offset = prevOffset + prevSize;
      this.itemOffsetCache[itemIndex] = offset;
    }
  };

  private getItemSizeCacheFor(itemIndex: number): number {
    return this.itemSizeCache[itemIndex];
  }

  getItemSpan = (itemIndex: number) => {
    if (!this.options.itemSpan) {
      return 1;
    }
    if (this.itemSpanValue[itemIndex] === undefined) {
      this.computeItemSpanUpTo(itemIndex);
    }
    return this.itemSpanValue[itemIndex] || 1;
  };

  getItemSpanParent = (itemIndex: number) => {
    if (!this.options.itemSpan) {
      return itemIndex;
    }
    if (this.itemSpanParent[itemIndex] === undefined) {
      this.computeItemSpanUpTo(itemIndex);
    }
    return this.itemSpanParent[itemIndex];
  };

  getItemSizeWithSpan = (itemIndex: number, itemSpan: number) => {
    let itemSize = this.getItemSize(itemIndex);

    while (itemSpan > 1) {
      itemIndex += 1;
      itemSpan -= 1;
      itemSize += this.getItemSize(itemIndex);
    }

    return itemSize;
  };

  /**
   * For now, this doesn't take into account the itemspan, and it's okay not to
   * @param itemIndex
   * @returns the size of the specified item
   */
  getItemSize = (itemIndex: number): number => {
    const { itemSize, count } = this.options;

    if (typeof itemSize !== 'function') {
      return itemSize;
    }

    // we make sure when we request the size for an item at a given index
    // all previous items have their size cached

    // we could take a more optimized approach, but for now, we only have
    // itemMainAxisSize as a function for column virtualization
    // which doesn't need a more performant approach right now, as we dont expect a column count > 10k

    let cachedSize = this.getItemSizeCacheFor(itemIndex);

    if (cachedSize === undefined) {
      let i = this.itemSizeCache.length;
      let lastIndex = Math.min(itemIndex, count - 1);

      for (; i <= lastIndex; i++) {
        this.computeCacheFor(i);
      }
      cachedSize = this.getItemSizeCacheFor(itemIndex);
    }

    return cachedSize;
  };

  getTotalSize = () => {
    const { count, itemSize } = this.options;
    if (typeof itemSize !== 'function') {
      return itemSize * count;
    }
    if (this.totalSize !== 0) {
      return this.totalSize;
    }

    const lastItemSize = this.getItemSize(count - 1);
    const lastItemOffset = this.itemOffsetCache[count - 1];

    return (this.totalSize = lastItemSize + lastItemOffset);
  };

  public getItemAt = (scrollPos: number): number => {
    const { itemSize, count } = this.options;
    if (typeof itemSize !== 'function') {
      return Math.min(Math.max(0, Math.floor(scrollPos / itemSize)), count - 1);
    }

    let lastOffsetIndex = this.itemOffsetCache.length - 1;
    let lastSizeIndex = this.itemSizeCache.length - 1;
    let lastOffset = this.itemOffsetCache[lastOffsetIndex];

    let _prev: number;

    while (lastOffset < scrollPos) {
      if (lastOffsetIndex >= count) {
        return count - 1;
      }
      lastSizeIndex += 1;
      this.computeCacheFor(lastSizeIndex);
      _prev = lastOffset;
      lastOffset = this.itemOffsetCache[lastSizeIndex];
      if (_prev === lastOffset && _prev != 0) {
        return count - 1;
      }
    }

    const searchResult = binarySearch(
      this.itemOffsetCache,
      scrollPos,
      SORT_ASC,
    );

    if (searchResult >= 0) {
      return searchResult;
    }

    return ~searchResult - 1;
  };

  public getItemOffsetFor = (itemIndex: number): number => {
    if (typeof this.options.itemSize !== 'function') {
      return itemIndex * this.options.itemSize;
    }
    let result = this.itemOffsetCache[itemIndex];

    if (result == null) {
      let lastSizeIndex = this.itemSizeCache.length - 1;

      while (lastSizeIndex < itemIndex) {
        lastSizeIndex += 1;
        this.computeCacheFor(lastSizeIndex);
      }

      result = this.itemOffsetCache[itemIndex];
    }
    return result;
  };

  destroy = () => {
    if (this.destroyed) {
      return;
    }
    this.notifyDestroy();
    this.reset();

    this.destroyed = true;
    this.onDestroyFns = [];
    this.onScrollFns = [];
    this.onTotalSizeChangeFns = [];
    this.onRenderCountChangeFns = [];
    this.onRenderRangeChangeFns = [];
  };
}
