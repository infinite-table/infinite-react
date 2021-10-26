import * as React from 'react';
import type { RefCallback } from 'react';
import type { Renderable } from '../types/Renderable';
import type { RenderItem } from './types';
import type { SubscriptionCallback } from '../types/SubscriptionCallback';
import type { RenderRange } from '../VirtualBrain';

import { Logger } from '../../utils/debug';

import { VirtualBrain } from '../VirtualBrain';

import { MappedItems } from './MappedItems';
import { AvoidReactDiff } from './AvoidReactDiff';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';

const ITEM_POSITION_WITH_TRANSFORM = true;

export class ReactVirtualRenderer extends Logger {
  private mappedItems: MappedItems;
  // needed for hot reload and react hooks executing twice in dev
  private destroyed: boolean = false;

  private itemDOMElements: Record<number, HTMLElement | null> = {};
  private itemDOMRefs: Record<number, RefCallback<HTMLElement>> = {};
  private updaters: Record<number, SubscriptionCallback<Renderable>> = {};

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
      onRender?: ReactVirtualRenderer['onRender'];
      channel?: string;
    },
  ) {
    super(
      `ReactVirtualRenderer:${brain.getOptions().mainAxis}` +
        (channel ? `:${channel}` : ''),
    );

    if (onRender) {
      this.onRender = onRender;
    }

    this.brain = brain;
    this.mappedItems = new MappedItems(brain.getOptions().mainAxis);
  }

  renderRange = (
    range: RenderRange,
    {
      renderItem,
      force,
      onRender,
    }: {
      renderItem: RenderItem;
      force: boolean;
      onRender?: (items: Renderable[]) => void;
    },
  ): Renderable[] => {
    // needed for hot reload and react hooks executing twice in dev
    if (this.destroyed) {
      return [];
    }
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

    if (this.onRender) {
      this.onRender(result);
    }
    if (onRender) {
      onRender(result);
    }
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
    this.updaters[elementIndex] = buildSubscriptionCallback<Renderable>();

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
    swapSpanned?: boolean,
  ) {
    // needed for hot reload and react hooks executing twice in dev
    if (this.destroyed) {
      return;
    }
    const spanParent = this.brain.getItemSpanParent(itemIndex);
    let covered = false;
    if (spanParent !== itemIndex) {
      // if (swapSpanned) {
      //   debugger;
      //   itemIndex = spanParent;
      // } else {
      covered = true;
      // }
    }
    const itemSize = this.brain.getItemSize(itemIndex);
    const itemSpan = this.brain.getItemSpan(itemIndex);
    const itemSizeWithSpan =
      itemSpan === 1
        ? itemSize
        : this.brain.getItemSizeWithSpan(itemIndex, itemSpan);

    const renderedNode = renderItem({
      spanParent,
      itemIndex,
      itemSize,
      itemSizeWithSpan,
      itemSpan,
      covered,
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
    this.destroyed = true;
    this.mappedItems.destroy();
    this.itemDOMElements = [];
    this.itemDOMRefs = [];
    this.updaters = [];
    (this as any).onRender = null;
    (this as any).renderItem = null;
    (this as any).brain = null;
  };
}
