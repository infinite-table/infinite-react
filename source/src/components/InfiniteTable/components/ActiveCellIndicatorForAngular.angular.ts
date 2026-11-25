import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';

import { stripVar } from '../../../utils/stripVar';
import type { MatrixBrain } from '../../VirtualBrain/MatrixBrain';

import { internalProps } from '../internalProps';
import { InternalVars } from '../internalVars.css';
import { setInfiniteVarsOnNode } from '../utils/infiniteDOMUtils';
import { getActiveCellIndicatorVars } from './activeIndicatorOffsets';
import {
  ActiveCellIndicatorRecipe,
  ActiveIndicatorWrapperCls,
} from './ActiveCellIndicator.css';

const { rootClassName } = internalProps;

const baseCls = `${rootClassName}-ActiveCellIndicator`;

const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

const INDICATOR_CLS = {
  visible: `${baseCls} ${ActiveCellIndicatorRecipe({ visible: true })}`,
  hidden: `${baseCls} ${ActiveCellIndicatorRecipe({ visible: false })}`,
};

/**
 * Angular sibling of ActiveCellIndicator (components/ActiveCellIndicator.tsx):
 * same DOM structure, class names and CSS-var positioning. The host is the
 * wrapper div.
 */
@Component({
  selector: 'div[infiniteActiveCellIndicator]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    // #correct-scroll-size this wrapper is here in order to make the
    // indicator not take up space in the scroll container
    '[class]': 'wrapperCls',
    'data-name': 'active-cell',
    '[style.z-index]': 'zIndex()',
  },
  template: `<div
    data-name="active-cell-indicator"
    [class]="active() ? indicatorCls.visible : indicatorCls.hidden"
  ></div>`,
})
export class ActiveCellIndicator {
  readonly activeCellIndex = input<[number, number] | null>(null);
  readonly brain = input.required<MatrixBrain>();
  readonly rowHeight = input<number | ((rowIndex: number) => number)>();

  protected readonly wrapperCls = ActiveIndicatorWrapperCls;
  protected readonly indicatorCls = INDICATOR_CLS;

  // brain.getInitialRows(), refreshed when the brain renders (React calls
  // rerender() on brain.onRenderCountChange) - a signal, so a render that
  // doesn't change the row count doesn't notify anything
  private readonly initialRows = signal(0);

  protected readonly active = computed(() => {
    const activeCellIndex = this.activeCellIndex();
    return activeCellIndex != null && this.initialRows() > activeCellIndex[0];
  });

  protected readonly zIndex = computed(() =>
    this.active()
      ? `var(${columnZIndexAtIndex}-${this.activeCellIndex()![1]})`
      : null,
  );

  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    const reposition = () => {
      const activeCellIndex = untracked(this.activeCellIndex);
      if (activeCellIndex == null) {
        return;
      }
      setInfiniteVarsOnNode(
        getActiveCellIndicatorVars(
          untracked(this.brain),
          activeCellIndex,
          untracked(this.rowHeight),
        ),
        this.host,
      );
    };

    let removeOnRenderCountChange: VoidFunction | null = null;
    let removeOnScrollOriginChange: VoidFunction | null = null;

    effect(() => {
      const brain = this.brain();
      untracked(() => {
        removeOnRenderCountChange?.();
        removeOnScrollOriginChange?.();
        this.initialRows.set(brain.getInitialRows());
        removeOnRenderCountChange = brain.onRenderCountChange(() => {
          this.initialRows.set(brain.getInitialRows());
        });
        // offsets are relative to the scroll origin - see largeContent.ts
        removeOnScrollOriginChange = brain.onScrollOriginChange(reposition);
      });
    });

    // Vue: watch([activeCellIndex, rowHeight, brain], reposition, { flush: 'post' })
    afterRenderEffect(() => {
      this.activeCellIndex();
      this.rowHeight();
      this.brain();
      untracked(reposition);
    });

    inject(DestroyRef).onDestroy(() => {
      removeOnRenderCountChange?.();
      removeOnScrollOriginChange?.();
    });
  }
}
