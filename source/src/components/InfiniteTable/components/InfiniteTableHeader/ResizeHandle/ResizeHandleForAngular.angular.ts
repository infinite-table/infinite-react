import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';

import { FlexComputeResizeResult } from '../../../../flexbox';
import { internalProps } from '../../../internalProps';
import { InfiniteTableComputedColumn } from '../../../types';
import { injectInfiniteTable } from '../../../InfiniteTableContextForAngular.angular';

import { getColumnResizer } from './columnResizer';
import {
  ResizeHandleCls,
  ResizeHandleDraggerClsRecipe,
  ResizeHandleRecipeCls,
} from './ResizeHandle.css';

const { rootClassName } = internalProps;

export const InfiniteTableHeaderCellResizeHandleCls = `${rootClassName}HeaderCell_ResizeHandle`;

export type ResizeFnParam = {
  diff: number;
  shareSpaceOnResize: boolean;
};

/**
 * Angular sibling of ResizeHandle/index.tsx - the drag handle at the edge
 * of resizable header cells; the host IS the handle div
 * (`div.InfiniteHeaderCell_ResizeHandle`), the dragger div inside it.
 *
 * Same pointer-capture drag as React and Vue: while dragging, the widths /
 * offsets are applied through the CSS vars (getColumnResizer); on pointer up
 * the final columnSizing lands in state through `onResize`. Shift + drag
 * shares the space with the next column; for columns pinned at the end the
 * diff is flipped.
 */
@Component({
  selector: 'div[infiniteResizeHandle]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassName()',
  },
  template: `@if (column()) {
    <div [style]="draggerStyle()" [class]="draggerClassName()"></div>
    }`,
})
export class ResizeHandle {
  readonly horizontalLayoutPageIndex = input<number | null>(null);
  readonly columnIndex = input.required<number>();
  readonly columns = input.required<InfiniteTableComputedColumn<any>[]>();
  readonly computeResize =
    input.required<(param: ResizeFnParam) => FlexComputeResizeResult>();
  readonly onResize = input.required<(param: ResizeFnParam) => void>();

  private readonly tableContext = injectInfiniteTable();
  private readonly element =
    inject<ElementRef<HTMLDivElement>>(ElementRef).nativeElement;
  private readonly domRef = { current: this.element as HTMLDivElement | null };

  private readonly constrained = signal(false);

  protected readonly column = computed(
    () =>
      this.columns()[this.columnIndex()] as
        | InfiniteTableComputedColumn<any>
        | undefined,
  );

  protected readonly hostClassName = computed(() => {
    const col = this.column();
    if (!col) {
      return InfiniteTableHeaderCellResizeHandleCls;
    }
    return `${InfiniteTableHeaderCellResizeHandleCls} ${ResizeHandleCls} ${ResizeHandleRecipeCls(
      {
        computedPinned: col.computedPinned,
        computedFirstInCategory: col.computedFirstInCategory,
        computedLastInCategory: col.computedLastInCategory,
      },
    )}`;
  });

  protected readonly draggerStyle = computed(() => {
    const col = this.column();
    if (!col) {
      return null;
    }
    // same as React and Vue, where the other cases set `right: undefined`
    // (a no-op): the last unpinned column keeps its dragger inside the cell
    return col.computedPinned === false && col.computedLastInCategory
      ? { right: '0px' }
      : null;
  });

  protected readonly draggerClassName = computed(() => {
    const col = this.column();
    return ResizeHandleDraggerClsRecipe({
      constrained: this.constrained(),
      computedPinned: col?.computedPinned,
      computedFirstInCategory: col?.computedFirstInCategory,
      computedLastInCategory: col?.computedLastInCategory,
    });
  });

  constructor() {
    const element = this.element;
    const onPointerDown = (event: PointerEvent) => this.onPointerDown(event);
    element.addEventListener('pointerdown', onPointerDown);
    inject(DestroyRef).onDestroy(() => {
      element.removeEventListener('pointerdown', onPointerDown);
    });
  }

  private onPointerDown(e: PointerEvent) {
    e.stopPropagation();

    const columns = untracked(this.columns);
    const columnIndex = untracked(this.columnIndex);
    const col = columns[columnIndex];
    if (!col) {
      return;
    }
    const computedPinned = col.computedPinned;
    const horizontalLayoutPageIndex = untracked(this.horizontalLayoutPageIndex);
    const computeResize = untracked(this.computeResize);
    const onResize = untracked(this.onResize);

    const { brain, headerBrain } = this.tableContext.getState();

    const shareSpaceOnResize = !!e.shiftKey;
    const pointerId = e.pointerId;
    const initialX = e.clientX;
    const target = e.target as HTMLElement;

    let restoreRenderRange: () => void = () => {};

    if (brain.isHorizontalLayoutBrain) {
      const restoreBodyRange = brain.extendRenderRange({
        start: true,
        end: true,
        direction: 'horizontal',
      });
      const restoreHeaderRange = headerBrain.extendRenderRange({
        start: true,
        end: true,
        direction: 'horizontal',
      });
      restoreRenderRange = () => {
        restoreBodyRange();
        restoreHeaderRange();
      };
    }

    target.setPointerCapture(pointerId);

    const resizer = getColumnResizer(columnIndex, {
      columns,
      shareSpaceOnResize,
      domRef: this.domRef,
    });

    const resizeDiff = (diff: number, { done }: { done?: boolean } = {}) => {
      if (horizontalLayoutPageIndex) {
        diff = diff / (horizontalLayoutPageIndex + 1);
        if (done) {
          diff = Math.round(diff);
        }
      }
      if (computedPinned === 'end') {
        diff *= -1;
      }
      const { adjustedDiff, constrained } = computeResize({
        diff,
        shareSpaceOnResize,
      });

      if (untracked(this.constrained) !== constrained) {
        this.constrained.set(constrained);
      }

      resizer.resize(adjustedDiff);

      return adjustedDiff;
    };

    const onPointerMove = (e: PointerEvent) => {
      resizeDiff(Math.round(e.clientX - initialX));
    };

    const onPointerUp = (e: PointerEvent) => {
      target.releasePointerCapture(pointerId);

      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerup', onPointerUp);

      const diff = Math.round(e.clientX - initialX);
      const adjustedDiff = resizeDiff(diff, { done: true });

      restoreRenderRange();

      // reset the drag-preview CSS vars to the committed sizes so the DOM
      // matches state even when the resize leaves the computed columns
      // unchanged
      resizer.resize(0);

      onResize({ diff: adjustedDiff, shareSpaceOnResize });
    };

    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUp);
  }
}
