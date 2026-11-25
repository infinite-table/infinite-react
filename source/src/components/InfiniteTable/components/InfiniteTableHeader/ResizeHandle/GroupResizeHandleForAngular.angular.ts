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

import { FlexComputeGroupResizeResult } from '../../../../flexbox';
import { InfiniteTableComputedColumn } from '../../../types';
import type { MatrixBrain } from '../../../../VirtualBrain/MatrixBrain';
import { ThemeVars } from '../../../vars.css';

import { getColumnGroupResizer } from './columnResizer';
import { InfiniteTableHeaderCellResizeHandleCls } from './ResizeHandleForAngular.angular';
import {
  ResizeHandleCls,
  ResizeHandleRecipeCls,
  ResizeHandleDraggerClsRecipe,
} from './ResizeHandle.css';

/**
 * Angular sibling of GroupResizeHandle.tsx - the drag handle at the edge of
 * resizable column group headers (the host IS the handle div). Same
 * pointer-capture drag as React and Vue.
 */
@Component({
  selector: 'div[infiniteGroupResizeHandle]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassName()',
  },
  template: `@if (column()) {
    <div [style]="draggerStyleValue()" [class]="draggerClassName()"></div>
    }`,
})
export class GroupResizeHandle {
  readonly groupColumns = input.required<InfiniteTableComputedColumn<any>[]>();
  readonly columns = input.required<InfiniteTableComputedColumn<any>[]>();
  readonly draggerStyle = input<Record<string, any>>();
  readonly brain = input.required<MatrixBrain>();
  readonly computeResize =
    input.required<(diff: number) => FlexComputeGroupResizeResult>();
  readonly onResize = input.required<(diff: number) => void>();

  private readonly element =
    inject<ElementRef<HTMLDivElement>>(ElementRef).nativeElement;
  private readonly domRef = { current: this.element as HTMLDivElement | null };

  private readonly constrained = signal(false);

  protected readonly column = computed(
    () =>
      this.groupColumns()[0] as InfiniteTableComputedColumn<any> | undefined,
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

  protected readonly draggerStyleValue = computed(() => {
    const col = this.column();
    const style: Record<string, any> = {};
    // same as React and Vue (where the other cases set `right: undefined`)
    if (col && col.computedPinned === false && col.computedLastInCategory) {
      style.right = ThemeVars.components.HeaderCell.resizeHandleWidth;
    }
    return { ...style, ...this.draggerStyle() };
  });

  protected readonly draggerClassName = computed(() =>
    ResizeHandleDraggerClsRecipe({
      constrained: this.constrained(),
    }),
  );

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

    const groupColumns = untracked(this.groupColumns);
    const col = groupColumns[0];
    if (!col) {
      return;
    }
    const computedPinned = col.computedPinned;
    const columns = untracked(this.columns);
    const brain = untracked(this.brain);
    const computeResize = untracked(this.computeResize);
    const onResize = untracked(this.onResize);

    const pointerId = e.pointerId;
    const initialX = e.clientX;
    const target = e.target as HTMLElement;

    target.setPointerCapture(pointerId);

    let initialMove = true;

    const resizer = getColumnGroupResizer(
      groupColumns.map((c) => c.computedVisibleIndex),
      {
        columns,
        domRef: this.domRef,
      },
    );

    const resizeDiff = (diff: number) => {
      if (computedPinned === 'end') {
        diff *= -1;
      }
      const { constrained, adjustedDiffs, adjustedDiff } = computeResize(diff);

      if (untracked(this.constrained) !== constrained) {
        this.constrained.set(constrained);
      }

      resizer.resize(adjustedDiffs);

      return adjustedDiff;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (initialMove) {
        // this group could be dragged so all columns have the minimum width
        // and new columns could come into the viewport, which might not be
        // rendered yet (virtualization) - so make the brain render
        // additional columns while dragging
        const maxDiff = groupColumns.reduce((diff, col) => {
          return diff + col.computedWidth - col.computedMinWidth;
        }, 0);
        const currentSize = brain.getAvailableSize();
        brain.update({
          width: currentSize.width + maxDiff,
          height: currentSize.height,
        });
        initialMove = false;
      }

      resizeDiff(Math.round(e.clientX - initialX));
    };

    const onPointerUp = (e: PointerEvent) => {
      target.releasePointerCapture(pointerId);

      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerup', onPointerUp);

      const diff = Math.round(e.clientX - initialX);
      const adjustedDiff = resizeDiff(diff);

      // reset the drag-preview CSS vars to the committed sizes - see the
      // same step in ResizeHandle
      resizer.resize(groupColumns.map(() => 0));

      onResize(adjustedDiff);
    };

    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUp);
  }
}
