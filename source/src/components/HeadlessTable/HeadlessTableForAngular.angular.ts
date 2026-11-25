import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { join } from '../../utils/join';
import { setupResizeObserver } from '../ResizeObserver/setupResizeObserver';
import type { ScrollPosition } from '../types/ScrollPosition';
import type { Size } from '../types/Size';
import type { Renderable } from '../types/Renderable';
import type { SubscriptionCallback } from '../types/SubscriptionCallback';
import type { MatrixBrain } from '../VirtualBrain/MatrixBrain';
import { scrollTransformTargetCls } from '../VirtualList/VirtualList.css';
import {
  VirtualScrollContainerChildToScrollCls,
  VirtualScrollContainerCls,
} from '../VirtualScrollContainer/VirtualScrollContainer.css';
import { getScrollableClassName } from '../VirtualScrollContainer/getScrollableClassName';
import { CELL_DETACHED_CLASSNAMES } from '../InfiniteTable/components/cellDetachedCls';
import type { GridRenderer } from './ReactHeadlessTableRenderer';
import type { TableRenderCellFn, TableRenderDetailRowFn } from './rendererTypes';
import { RawTable } from './RawTableForAngular.angular';
import { ActiveCellIndicator } from '../InfiniteTable/components/ActiveCellIndicatorForAngular.angular';
import { ActiveRowIndicator } from '../InfiniteTable/components/ActiveRowIndicatorForAngular.angular';

const CHILD_TO_SCROLL_CLS = join(
  scrollTransformTargetCls,
  VirtualScrollContainerChildToScrollCls,
);

const SCROLL_CONTAINER_CLS = join(
  'InfiniteVirtualScrollContainer',
  VirtualScrollContainerCls,
  getScrollableClassName(true),
);

/**
 * Angular sibling of HeadlessTable (HeadlessTable/index.tsx): the scrollable
 * virtualized grid shell. Its host IS the scroll container (put it on a
 * div: `<div infiniteHeadlessTable ...>`), with the transform target (the
 * RawTable cells and the active cell indicator), the active row indicator
 * and the scroll-size placeholder inside.
 *
 * The scroll listener is a native one: it never schedules an Angular change
 * detection; the brain repositions the cells and the transform target gets
 * its transform in a requestAnimationFrame.
 */
@Component({
  selector: 'div[infiniteHeadlessTable]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RawTable, ActiveCellIndicator, ActiveRowIndicator],
  host: {
    '[attr.tabindex]': 'tabIndex()',
  },
  template: `
    <div
      #transformTarget
      [class]="childToScrollCls"
      data-name="scroll-transform-target"
    >
      <ng-container
        infiniteRawTable
        [brain]="brain()"
        [renderCell]="renderCell()"
        [renderDetailRow]="renderDetailRow()"
        [cellHoverClassNames]="cellHoverClassNames()"
        [cellDetachedClassNames]="cellDetachedClassNames"
        [renderer]="renderer()"
        [onRenderUpdater]="onRenderUpdater()"
        [forceRerenderTimestamp]="forceRerenderTimestamp()"
      />
      @if (activeCellIndex() != null) {
        <div
          infiniteActiveCellIndicator
          [brain]="brain()"
          [rowHeight]="activeCellRowHeight()"
          [activeCellIndex]="activeCellIndex()"
        ></div>
      }
      <ng-content select="[infiniteTransformTargetContent]" />
    </div>
    @if (activeRowIndex() != null) {
      <div
        infiniteActiveRowIndicator
        [brain]="brain()"
        [activeRowIndex]="activeRowIndex()"
      ></div>
    }
    <ng-content />
    <div
      data-name="SpacePlaceholder"
      [attr.data-placeholder-width]="dev ? scrollSize().width : null"
      [attr.data-placeholder-height]="dev ? scrollSize().height : null"
      [style.height.px]="scrollSize().height"
      [style.width.px]="scrollSize().width"
      style="z-index: -1; opacity: 0; pointer-events: none; contain: strict"
    ></div>
  `,
})
export class HeadlessTable {
  readonly brain = input.required<MatrixBrain>();
  readonly renderCell = input.required<TableRenderCellFn>();
  readonly renderDetailRow = input<TableRenderDetailRowFn>();
  readonly cellHoverClassNames = input<string[]>();
  readonly renderer = input<GridRenderer>();
  readonly onRenderUpdater = input<SubscriptionCallback<Renderable>>();
  readonly forceRerenderTimestamp = input<number>();
  readonly scrollStopDelay = input<number>();
  readonly wrapRowsHorizontally = input<boolean>();
  readonly autoFocus = input<boolean>();
  readonly tabIndex = input<number>();
  readonly scrollerRef = input<(el: HTMLElement | null) => void>();
  /** the active row indicator is rendered (outside the scroll transform target) when not null */
  readonly activeRowIndex = input<number | null>(null);
  /** the active cell indicator is rendered (inside the scroll transform target) when not null */
  readonly activeCellIndex = input<[number, number] | null>(null);
  readonly activeCellRowHeight = input<number | ((rowIndex: number) => number)>();

  protected readonly childToScrollCls = CHILD_TO_SCROLL_CLS;
  protected readonly cellDetachedClassNames = CELL_DETACHED_CLASSNAMES;
  protected readonly dev = __DEV__;

  protected readonly scrollSize = signal<Size>({ width: 0, height: 0 });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)
    .nativeElement;
  private readonly transformTarget =
    viewChild.required<ElementRef<HTMLElement>>('transformTarget');

  constructor() {
    this.host.classList.add(...SCROLL_CONTAINER_CLS.split(' ').filter(Boolean));

    effect(() => {
      const scrollStopDelay = this.scrollStopDelay();
      const brain = this.brain();
      if (scrollStopDelay != null) {
        brain.setScrollStopDelay(scrollStopDelay);
      }
    });

    const destroyRef = inject(DestroyRef);

    let removeResizeObserver: VoidFunction | null = null;
    let removeOnRenderCount: VoidFunction | null = null;

    const updateDOMTransform = (contentScrollPos: ScrollPosition) => {
      // relative to the scroll origin, like all the cells - see
      // largeContent.ts. Computed now, not in the raf: cells were
      // (re)positioned for this origin
      const scrollPos = untracked(this.brain).getDOMScrollPosition(
        contentScrollPos,
      );
      requestAnimationFrame(() => {
        const target = this.transformTarget()?.nativeElement;
        if (!target) {
          return;
        }
        target.style.setProperty(
          'transform',
          `translate3d(${-scrollPos.scrollLeft}px, ${-scrollPos.scrollTop}px, 0px)`,
        );
      });
    };

    const onScroll = () => {
      // the scroll container may be shorter than the content (when the
      // content is larger than what browsers support) - the brain works with
      // content positions - see largeContent.ts
      const brain = untracked(this.brain);
      brain.setScrollPosition(
        brain.toContentScrollPosition({
          scrollTop: this.host.scrollTop,
          scrollLeft: this.host.scrollLeft,
        }),
        updateDOMTransform,
      );
    };

    const wireBrain = (brain: MatrixBrain) => {
      removeOnRenderCount?.();

      // the spacer gets the content size, capped at what the browser supports
      removeOnRenderCount = brain.onRenderCountChange(() => {
        this.scrollSize.set(brain.getNativeScrollSize());
      });

      this.scrollSize.set(brain.getNativeScrollSize());

      // useful when the brain is changed - when toggling the value of
      // wrapRowsHorizontally
      updateDOMTransform(
        brain.getScrollPosition() || { scrollLeft: 0, scrollTop: 0 },
      );
    };

    const wireResizeObserver = () => {
      removeResizeObserver?.();
      removeResizeObserver = setupResizeObserver(
        this.host,
        () => {
          // it's not enough to read the size from onResize since that doesn't
          // account for scrollbar presence and size, so we read it from the
          // DOM (clientWidth/clientHeight)
          untracked(this.brain).update({
            height: this.host.clientHeight,
            width: this.host.clientWidth,
          });
        },
        { debounce: 50 },
      );
    };

    afterNextRender(() => {
      this.host.addEventListener('scroll', onScroll, { passive: false });
      this.scrollerRef()?.(this.host);
      if (this.autoFocus() && document.activeElement !== this.host) {
        this.host.focus();
      }
    });

    let wiredBrain: MatrixBrain | null = null;
    effect(() => {
      const brain = this.brain();
      this.wrapRowsHorizontally();
      untracked(() => {
        if (brain !== wiredBrain) {
          wiredBrain = brain;
          wireBrain(brain);
        }
        wireResizeObserver();
      });
    });

    // When the scroll ratio changes (huge content that grows/shrinks, or
    // starts/stops being huge), keep the content the user was looking at:
    // rewrite the native scroll position for the new ratio - see
    // largeContent.ts
    let scrollRatio: { brain: MatrixBrain | null; vertical: number; horizontal: number } = {
      brain: null,
      vertical: 1,
      horizontal: 1,
    };
    effect(() => {
      this.scrollSize();
      const brain = this.brain();
      untracked(() => {
        const prev = scrollRatio;
        const vertical = brain.getScrollRatio('vertical');
        const horizontal = brain.getScrollRatio('horizontal');
        scrollRatio = { brain, vertical, horizontal };

        if (
          prev.brain !== brain ||
          (prev.vertical === vertical && prev.horizontal === horizontal)
        ) {
          return;
        }
        const nativeScrollPos = brain.toNativeScrollPosition(
          brain.getScrollPosition(),
        );
        if (prev.vertical !== vertical) {
          this.host.scrollTop = nativeScrollPos.scrollTop;
        }
        if (prev.horizontal !== horizontal) {
          this.host.scrollLeft = nativeScrollPos.scrollLeft;
        }
      });
    });

    destroyRef.onDestroy(() => {
      this.host.removeEventListener('scroll', onScroll);
      untracked(this.scrollerRef)?.(null);
      removeResizeObserver?.();
      removeOnRenderCount?.();
    });
  }
}
