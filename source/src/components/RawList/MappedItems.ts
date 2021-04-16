import { Logger } from '../../utils/debug';
import { Renderable } from '../types/Renderable';

export class MappedItems extends Logger {
  private elementIndexToItemIndex!: Record<number, number>;
  private itemIndexToElementIndex!: Record<number, number>;
  private renderedElements!: Record<number, Renderable>;

  constructor(axis: string) {
    super(`MappedItems:${axis}`);
    this.init();
  }

  init() {
    this.elementIndexToItemIndex = {};
    this.itemIndexToElementIndex = {};
    this.renderedElements = {};
  }

  destroy() {
    this.init();
  }

  getUnrenderedItems = (startIndex: number, endIndex: number) => {
    const result: number[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (!this.isRenderedItem(i)) {
        result.push(i);
      }
    }

    return result;
  };

  getElementsOutsideItemRange = (startIndex: number, endIndex: number) => {
    const map = this.elementIndexToItemIndex;
    const result: number[] = [];
    for (const elementIndex in map) {
      const itemIndex = map[elementIndex];

      if (itemIndex < startIndex || itemIndex > endIndex) {
        result.push(((elementIndex as any) as number) >> 0);
      }
    }

    return result;
  };

  getFirstUnrenderedElementIndex = (endIndex: number, startFrom = 0) => {
    for (let i = startFrom; i <= endIndex; i++) {
      if (this.getItemRenderedAtElementIndex(i) == null) {
        return i;
      }
    }

    return -1;
  };

  getElementIndexForItem = (itemIndex: number): number | null => {
    return this.itemIndexToElementIndex[itemIndex] ?? null;
  };

  isRenderedItem = (itemIndex: number): boolean => {
    return this.itemIndexToElementIndex[itemIndex] != null;
  };

  isElementRendered = (elementIndex: number): boolean => {
    return this.getItemRenderedAtElementIndex(elementIndex) != null;
  };

  getItemRenderedAtElementIndex = (elementIndex: number): number | null => {
    const itemIndex = this.elementIndexToItemIndex[elementIndex];

    return itemIndex == null ? null : itemIndex;
  };

  getRenderedElement = (elementIndex: number): Renderable => {
    return this.renderedElements[elementIndex];
  };

  getRenderedElementAtItemIndex = (itemIndex: number): Renderable => {
    const elementIndex = this.itemIndexToElementIndex[itemIndex];
    return this.renderedElements[elementIndex];
  };

  renderItemAtElement(
    itemIndex: number,
    elementIndex: number,
    renderNode?: Renderable,
  ) {
    if (__DEV__) {
      this.debug(`Render item ${itemIndex} at element ${elementIndex}`);
    }
    const currentItemIndex: null | number = this.elementIndexToItemIndex[
      elementIndex
    ];

    if (currentItemIndex != null) {
      delete this.itemIndexToElementIndex[currentItemIndex];
    }

    if (renderNode) {
      this.renderedElements[elementIndex] = renderNode;
    }
    this.elementIndexToItemIndex[elementIndex] = itemIndex;
    this.itemIndexToElementIndex[itemIndex] = elementIndex;
  }

  discardItem = (itemIndex: number) => {
    const elementIndex = this.itemIndexToElementIndex[itemIndex];
    if (elementIndex != null) {
      delete this.renderedElements[elementIndex];
      delete this.elementIndexToItemIndex[elementIndex];
      delete this.itemIndexToElementIndex[itemIndex];
    }
  };

  discardElement = (elementIndex: number): boolean => {
    const itemIndex = this.elementIndexToItemIndex[elementIndex];
    if (itemIndex != null) {
      delete this.renderedElements[elementIndex];
      delete this.elementIndexToItemIndex[elementIndex];
      delete this.itemIndexToElementIndex[itemIndex];

      return true;
    }
    return false;
  };

  discardElementsStartingWith = (
    elementIndex: number,
    callback?: (index: number) => void,
  ) => {
    let discarded: boolean;
    let oneDiscarded: boolean = false;
    do {
      discarded = this.discardElement(elementIndex);
      if (discarded) {
        oneDiscarded = true;
        if (callback) {
          callback(elementIndex);
        }
      }

      elementIndex++;
    } while (discarded);

    return oneDiscarded;
  };
}
