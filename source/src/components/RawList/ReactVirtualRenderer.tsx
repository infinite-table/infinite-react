import * as React from 'react';
import type { RefCallback } from 'react';
import type { Renderable } from '../types/Renderable';
import type { RenderItem, UpdaterChangeFn, UpdaterFn } from './types';
import type { RenderRange } from '../VirtualBrain';

import { Logger } from '../../utils/debug';

import { VirtualBrain } from '../VirtualBrain';

import { MappedItems } from './MappedItems';
import { AvoidReactDiff } from './AvoidReactDiff';

export const buildUpdater = (): UpdaterFn => {
  let result: Renderable = null;
  let fns: UpdaterChangeFn[] = [];

  const updater = (items: Renderable) => {
    result = items;

    // change happens here
    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i](items);
    }
  };

  updater.get = () => result;

  // this attaches a new listener to changes
  updater.onChange = (fn: UpdaterChangeFn) => {
    fns.push(fn);
    return () => {
      fns = fns.filter((f) => f !== fn);
    };
  };

  updater.destroy = () => {
    updater(null);
    fns.length = 0;
  };

  return updater;
};

const ITEM_POSITION_WITH_TRANSFORM = true;

export class ReactVirtualRenderer extends Logger {
  private mappedItems: MappedItems;

  private itemDOMElements: Record<number, HTMLElement | null> = {};
  private itemDOMRefs: Record<number, RefCallback<HTMLElement>> = {};
  private updaters: Record<number, UpdaterFn> = {};

  private onRender: (items: Renderable[]) => void = () => null;
  private brain: VirtualBrain;

  private items: Renderable[] = [];
  prevLength: number = 0;

  constructor(
    brain: VirtualBrain,
    {
      onRender,
      channel,
    }: {
      onRender: (items: Renderable[]) => void;
      channel?: string;
    },
  ) {
    super(
      `ReactVirtualRenderer:${brain.getOptions().mainAxis}` + (channel ?? ''),
    );

    this.onRender = onRender;

    this.brain = brain;
    this.mappedItems = new MappedItems(brain.getOptions().mainAxis);
  }

  renderRange = (
    range: RenderRange,
    { renderItem, force }: { renderItem: RenderItem; force: boolean },
  ): Renderable[] => {
    const { mappedItems } = this;
    const { renderStartIndex, renderEndIndex } = range;

    if (__DEV__) {
      this.debug(
        `Render range ${renderStartIndex}-${renderEndIndex}. Force ${force}`,
      );
    }

    const renderCount =
      renderEndIndex === -1 ? 0 : renderEndIndex - renderStartIndex + 1;

    if (this.itemDOMElements[renderCount]) {
      mappedItems.discardElementsStartingWith(renderCount, (elementIndex) => {
        delete this.itemDOMElements[elementIndex];
        delete this.itemDOMRefs[elementIndex];

        // when less items become rendered
        // we unmount the extra items by calling destroy on the updater
        // so we don't need to re-render the whole container
        if (this.updaters[elementIndex]) {
          this.updaters[elementIndex].destroy();
          delete this.updaters[elementIndex];
        }

        delete this.items[elementIndex];
        if (__DEV__) {
          this.debug(`Discard element ${elementIndex}`);
        }
      });
    }
    if (this.items.length > renderCount) {
      this.items.length = renderCount;
    }

    const elementsOutsideItemRange =
      this.mappedItems.getElementsOutsideItemRange(
        renderStartIndex,
        renderEndIndex,
      );

    // start from the last rendered, and render additional elements, until we have renderCount
    // this loop might not even execute the body once if all the elements are present
    for (let i = this.items.length; i < renderCount; i++) {
      this.renderElement(i);
      // push at start
      elementsOutsideItemRange.splice(0, 0, i);
    }

    for (let i = renderStartIndex; i <= renderEndIndex; i++) {
      if (mappedItems.isRenderedItem(i)) {
        if (force) {
          this.renderItemAtElement(i, undefined, renderItem);
        }
        continue;
      }

      const elementIndex = elementsOutsideItemRange.pop();
      if (elementIndex == null) {
        if (__DEV__) {
          this.error(`Cannot find element to render item ${i}`);
        }
        continue;
      }
      this.renderItemAtElement(i, elementIndex, renderItem);
    }

    // OLD we need to spread and create a new array
    // OLD as otherwise the AvoidReactDiff component will receive the same array
    // OLD and since it uses setState internally, it will not render/update
    // const result = [...this.items];
    let result = this.items;

    // TODO why does this optimisation not work
    // if (this.items.length > this.prevLength) {
    //   // only assign and do a render when
    //   // we have more items than last time
    //   // so we need to show new items
    result = [...this.items];
    this.onRender(result);
    //   this.prevLength = result.length;
    // }

    return result;
  };

  private renderElement(elementIndex: number) {
    const domRef = (node: HTMLElement) => {
      if (node) {
        this.itemDOMElements[elementIndex] = node;
        this.updateElementPosition(elementIndex);
      }
    };
    this.itemDOMRefs[elementIndex] = domRef;
    this.updaters[elementIndex] = buildUpdater();

    const item = (
      <AvoidReactDiff
        key={elementIndex}
        name={`${elementIndex}`}
        updater={this.updaters[elementIndex]}
      />
    );

    // if (__DEV__) {
    //   this.debug(`Mount element ${elementIndex}`);
    // }
    this.items[elementIndex] = item;

    return item;
  }

  private renderItemAtElement(
    itemIndex: number,
    elementIndex = this.mappedItems.getElementIndexForItem(itemIndex) as number,
    renderItem: RenderItem,
  ) {
    const renderedNode = renderItem({
      itemIndex,
      itemSize: this.brain.getItemSize(itemIndex),
      domRef: this.itemDOMRefs[elementIndex],
    });

    const itemUpdater = this.updaters[elementIndex];

    if (!itemUpdater) {
      this.error(
        `Cannot find item updater for item ${itemIndex} at this time... sorry.`,
      );
      return;
    }
    this.mappedItems.renderItemAtElement(itemIndex, elementIndex, renderedNode);

    if (__DEV__) {
      this.debug(`Render item ${itemIndex} at element ${elementIndex}`);
    }
    itemUpdater(renderedNode);

    this.updateElementPosition(elementIndex);
  }

  private updateElementPosition = (elementIndex: number) => {
    const itemElement = this.itemDOMElements[elementIndex];
    const itemIndex =
      this.mappedItems.getItemRenderedAtElementIndex(elementIndex);

    const options = this.brain.getOptions();

    if (itemIndex == null) {
      if (__DEV__) {
        this.error(`Cannot find item for element ${elementIndex}`);
      }
      return;
    }

    const itemPosition = this.brain.getItemOffsetFor(itemIndex);

    if (itemPosition == null) {
      return;
    }

    if (itemElement) {
      if (__DEV__) {
        (itemElement.dataset as any).elementIndex = elementIndex;
        (itemElement.dataset as any).itemIndex = itemIndex;
      }

      if (ITEM_POSITION_WITH_TRANSFORM) {
        itemElement.style.transform =
          options.mainAxis === 'vertical'
            ? `translateY(${itemPosition}px)`
            : `translateX(${itemPosition}px)`;
        itemElement.style.visibility = '';
      } else {
        itemElement.style.display = '';
        itemElement.style[
          options.mainAxis === 'vertical' ? 'top' : 'left'
        ] = `${itemPosition}px`;
      }
    }
  };

  destroy = () => {
    this.mappedItems.destroy();
    this.itemDOMElements = [];
    this.itemDOMRefs = [];
    this.updaters = [];
    (this as any).onRender = null;
    (this as any).renderItem = null;
    (this as any).brain = null;
  };
}
