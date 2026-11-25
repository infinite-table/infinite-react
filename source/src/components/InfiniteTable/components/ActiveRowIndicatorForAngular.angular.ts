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
  viewChild,
} from '@angular/core';

import { stripVar } from '../../../utils/stripVar';
import type { ScrollPosition } from '../../types/ScrollPosition';
import type { MatrixBrain } from '../../VirtualBrain/MatrixBrain';

import { internalProps } from '../internalProps';
import { InternalVars } from '../internalVars.css';
import { setInfiniteVarsOnNode } from '../utils/infiniteDOMUtils';
import { ThemeVars } from '../vars.css';
import { ActiveIndicatorWrapperCls } from './ActiveCellIndicator.css';
import { ActiveRowIndicatorRecipe } from './ActiveRowIndicator.css';
import {
  getActiveRowIndicatorScrollVars,
  getActiveRowIndicatorVars,
} from './activeIndicatorOffsets';

const { rootClassName } = internalProps;
const baseCls = `${rootClassName}-ActiveRowIndicator`;

const transformX = `calc(${InternalVars.activeCellRowOffsetX} + var(${stripVar(
  InternalVars.scrollLeftForActiveRowWhenHorizontalLayout,
)}, 0px))`;

const ActiveStyle: Record<string, string> = {
  [stripVar(InternalVars.activeCellOffsetY)]: InternalVars.activeCellRowOffset,

  transform: `translate3d(${transformX}, calc( ${
    InternalVars.activeCellOffsetY
  } + var(${stripVar(InternalVars.scrollTopForActiveRow)}, 0px)), 0px)`,
  height: InternalVars.activeCellRowHeight,
  maxWidth: ThemeVars.runtime.totalVisibleColumnsWidthVar,
};

const INDICATOR_CLS = {
  active: `${baseCls} ${ActiveRowIndicatorRecipe({ active: true })}`,
  inactive: `${baseCls} ${ActiveRowIndicatorRecipe({ active: false })}`,
};

/**
 * Angular sibling of ActiveRowIndicator (components/ActiveRowIndicator.tsx):
 * same DOM structure, class names and CSS-var positioning, including the
 * scroll-synced transform vars (written natively on scroll). The host is
 * the wrapper div.
 */
@Component({
  selector: 'div[infiniteActiveRowIndicator]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    // #correct-scroll-size this wrapper is here in order to make the
    // indicator not take up space in the scroll container
    '[class]': 'wrapperCls',
    'data-name': 'active-row',
  },
  template: `<div
    #indicator
    data-name="active-row-indicator"
    [class]="active() ? indicatorCls.active : indicatorCls.inactive"
    [style]="active() ? activeStyle : null"
  ></div>`,
})
export class ActiveRowIndicator {
  readonly activeRowIndex = input<number | null>(null);
  readonly brain = input.required<MatrixBrain>();

  protected readonly wrapperCls = ActiveIndicatorWrapperCls;
  protected readonly indicatorCls = INDICATOR_CLS;
  protected readonly activeStyle = ActiveStyle;

  // brain.getInitialRows(), refreshed when the brain renders - see
  // ActiveCellIndicator
  private readonly initialRows = signal(0);

  protected readonly active = computed(() => {
    const activeRowIndex = this.activeRowIndex();
    return activeRowIndex != null && this.initialRows() > activeRowIndex;
  });

  private readonly indicator =
    viewChild.required<ElementRef<HTMLElement>>('indicator');

  constructor() {
    const getNode = () => untracked(this.indicator)?.nativeElement ?? null;

    const reposition = () => {
      const activeRowIndex = untracked(this.activeRowIndex);
      if (activeRowIndex == null) {
        return;
      }
      setInfiniteVarsOnNode(
        getActiveRowIndicatorVars(untracked(this.brain), activeRowIndex),
        getNode(),
      );
    };

    const updateScrollVars = (scrollPosition: ScrollPosition) => {
      setInfiniteVarsOnNode(
        getActiveRowIndicatorScrollVars(untracked(this.brain), scrollPosition),
        getNode(),
      );
    };

    let removeOnScroll: VoidFunction | null = null;
    let removeOnRenderCountChange: VoidFunction | null = null;
    let removeOnScrollOriginChange: VoidFunction | null = null;

    effect(() => {
      const brain = this.brain();
      untracked(() => {
        removeOnScroll?.();
        removeOnRenderCountChange?.();
        removeOnScrollOriginChange?.();

        this.initialRows.set(brain.getInitialRows());
        // native: the scroll never goes through change detection
        removeOnScroll = brain.onScroll(updateScrollVars);
        removeOnRenderCountChange = brain.onRenderCountChange(() => {
          this.initialRows.set(brain.getInitialRows());
        });
        // offsets are relative to the scroll origin - see largeContent.ts
        removeOnScrollOriginChange = brain.onScrollOriginChange(reposition);
      });
    });

    // after the view exists (the vars go on the inner div): the scroll vars
    // whenever the brain changes, the offsets also when the active row does
    let scrollVarsBrain: MatrixBrain | null = null;
    afterRenderEffect(() => {
      const brain = this.brain();
      this.activeRowIndex();
      untracked(() => {
        if (brain !== scrollVarsBrain) {
          scrollVarsBrain = brain;
          updateScrollVars(brain.getScrollPosition());
        }
        reposition();
      });
    });

    inject(DestroyRef).onDestroy(() => {
      removeOnScroll?.();
      removeOnRenderCountChange?.();
      removeOnScrollOriginChange?.();
    });
  }
}
