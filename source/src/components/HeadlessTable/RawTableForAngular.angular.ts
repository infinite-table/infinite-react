import {
  Directive,
  Injector,
  OnDestroy,
  ViewContainerRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  untracked,
} from '@angular/core';

import type { Renderable } from '../types/Renderable';
import type { SubscriptionCallback } from '../types/SubscriptionCallback';
import type { MatrixBrain } from '../VirtualBrain/MatrixBrain';
import type { GridRenderer } from './ReactHeadlessTableRenderer';
import type {
  TableRenderCellFn,
  TableRenderDetailRowFn,
} from './rendererTypes';
import { createRenderer, getPooledViewHost } from './createRenderer.angular';

/**
 * No renderer was passed in, so this is a table used on its own, not inside
 * InfiniteTable - nobody else sets the CSS vars that position the cells
 * (see GridRenderer.ownsPositionVars).
 */
function createOwnRenderer(brain: MatrixBrain) {
  const result = createRenderer(brain);
  result.renderer.ownsPositionVars = true;
  return result;
}

/**
 * Angular sibling of RawTable.tsx: wires the MatrixBrain render range to the
 * shared GridRenderer. The cells (one component view each, see
 * AngularPooledViews.angular.ts) are created in this directive's view
 * container, so they are DOM siblings of the `<ng-container>` it is on.
 *
 * IMPORTANT: brain and renderer are imperative objects shared with the
 * framework-neutral core - pass them as they are (never wrapped).
 */
@Directive({
  selector: 'ng-container[infiniteRawTable]',
})
export class RawTable implements OnDestroy {
  readonly brain = input.required<MatrixBrain>();
  readonly renderCell = input.required<TableRenderCellFn>();
  readonly renderDetailRow = input<TableRenderDetailRowFn>();
  readonly cellHoverClassNames = input<string[]>();
  readonly cellDetachedClassNames = input<string[]>();
  readonly renderer = input<GridRenderer>();
  readonly onRenderUpdater = input<SubscriptionCallback<Renderable>>();
  readonly forceRerenderTimestamp = input<number>();

  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);

  private readonly rendererAndUpdater = computed(() => {
    const renderer = this.renderer();
    const onRenderUpdater = this.onRenderUpdater();
    return renderer && onRenderUpdater
      ? { renderer, onRenderUpdater }
      : createOwnRenderer(this.brain());
  });

  private removeOnRenderRangeChange: VoidFunction | null = null;
  private boundViewHost: ReturnType<typeof getPooledViewHost> | null = null;

  constructor() {
    afterRenderEffect(() => {
      this.rendererAndUpdater().renderer.cellHoverClassNames =
        this.cellHoverClassNames() || [];
    });
    afterRenderEffect(() => {
      this.rendererAndUpdater().renderer.cellDetachedClassNames =
        this.cellDetachedClassNames() || [];
    });

    // like the React useLayoutEffect: initial wiring after the first render,
    // re-wiring whenever one of the dependencies changes
    afterRenderEffect(() => {
      const { renderer } = this.rendererAndUpdater();
      const brain = this.brain();
      const renderCell = this.renderCell();
      const renderDetailRow = this.renderDetailRow();
      this.forceRerenderTimestamp();

      untracked(() =>
        this.wireRenderRange(renderer, brain, renderCell, renderDetailRow),
      );
    });
  }

  private wireRenderRange(
    renderer: GridRenderer,
    brain: MatrixBrain,
    renderCell: TableRenderCellFn,
    renderDetailRow: TableRenderDetailRowFn | undefined,
  ) {
    this.removeOnRenderRangeChange?.();

    const viewHost = getPooledViewHost(renderer);
    if (this.boundViewHost && this.boundViewHost !== viewHost) {
      this.boundViewHost.unbind(this.vcr);
    }
    viewHost.bind({ vcr: this.vcr, injector: this.injector });
    this.boundViewHost = viewHost;

    // onRender is called at the end of every renderRange: commit the cells
    // that got new content, synchronously
    const onRender = viewHost.commit;

    renderer.renderRange(brain.getRenderRange(), {
      onRender,
      force: true,
      renderCell,
      renderDetailRow,
    });

    this.removeOnRenderRangeChange = brain.onRenderRangeChange(
      (renderRange) => {
        renderer.renderRange(renderRange, {
          force: false,
          onRender,
          renderCell,
          renderDetailRow,
        });
      },
    );
  }

  ngOnDestroy() {
    this.removeOnRenderRangeChange?.();
    this.removeOnRenderRangeChange = null;
    this.boundViewHost?.unbind(this.vcr);
    this.boundViewHost = null;
  }
}
