/**
 * Angular sibling of FlashingColumnCell.tsx - a `column.components.ColumnCell`
 * override that flashes the cell whenever its value changes.
 *
 * Built on the cell root override mechanism (see InfiniteColumnCellHost):
 * the host element is the cell, the default children come from
 * `injectColumnCellChildren()`. The flash is applied imperatively
 * (classList + a CSS var for the duration), exactly like React and Vue; the
 * change detection mirrors Vue's watch: flash only when the value changed
 * for the same cell (same column + row) - a cell recycled for another row
 * just resyncs.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Type,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';

import { stripVar } from '../../../../utils/stripVar';
import { InfiniteRender } from '../../../RawList/InfiniteRenderForAngular.angular';
import type { Renderable } from '../../../types/FrameworkTypes.angular';
import { InternalVars } from '../../internalVars.css';
import { injectInfiniteTable } from '../../InfiniteTableContextForAngular.angular';
import { FlashingColumnCellRecipe } from '../cell.css';

import {
  injectColumnCell,
  injectColumnCellChildren,
} from './InfiniteTableColumnCellForAngular.angular';

export type FlashingCellOptions = {
  flashDuration?: number;
  flashClassName?: string;
  /**
   * Renders the content of the cell: `children` is the default content (the
   * content div, plus the editor while editing), `oldValue` the value before
   * the last change (null until the value changes).
   */
  render?: (props: { children: Renderable; oldValue: any }) => Renderable;
};

const currentFlashingDurationVar = stripVar(
  InternalVars.currentFlashingDuration,
);

const defaultRender: NonNullable<FlashingCellOptions['render']> = ({
  children,
}) => children;

export const DEFAULT_FLASH_DURATION = 1000;

type FlashDirection = 'up' | 'down' | 'neutral';

const INTERNAL_FLASH_CLS_FOR_DIRECTION: Record<FlashDirection, string[]> = {
  up: FlashingColumnCellRecipe({
    direction: 'up',
  }).split(' '),
  down: FlashingColumnCellRecipe({
    direction: 'down',
  }).split(' '),
  neutral: FlashingColumnCellRecipe({
    direction: 'neutral',
  }).split(' '),
};

let variantCount = 0;

/**
 * Creates a `components.ColumnCell` override that flashes the cell when its
 * value changes:
 *
 * ```ts
 * columns = {
 *   price: {
 *     field: 'price',
 *     components: { ColumnCell: createFlashingColumnCellComponent({ flashDuration: 500 }) },
 *   },
 * };
 * ```
 */
export function createFlashingColumnCellComponent(
  options: FlashingCellOptions = {},
): Type<unknown> {
  const {
    flashDuration: FLASH_DURATION,
    flashClassName,
    render = defaultRender,
  } = options;

  // every call creates a component class with the same metadata; Angular
  // derives the component id from the metadata and the names of the
  // prototype members, so a uniquely named member keeps the ids apart
  // (otherwise: NG0912 "Component ID generation collision" in dev mode)
  const variantKey = `__infiniteFlashingColumnCellVariant${variantCount++}`;

  @Component({
    selector: 'div[infiniteFlashingColumnCell]',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [InfiniteRender],
    template: `<ng-container [infiniteRender]="content()" />`,
  })
  class FlashingColumnCell {
    [variantKey]() {}

    private readonly cell = injectColumnCell<any>();
    private readonly children = injectColumnCellChildren();
    private readonly table = injectInfiniteTable();

    private readonly oldValue = signal<any>(null);

    protected readonly content = computed(() =>
      render({ children: this.children(), oldValue: this.oldValue() }),
    );

    private flashTimeoutId: any = undefined;
    private flashDirection: FlashDirection | undefined = undefined;

    constructor() {
      let last: { columnId: string; rowId: any; value: any } | null = null;

      // runs after the cell directive built the new cell (effects run after
      // the ngDoCheck hooks of the element)
      effect(() => {
        const ctx = this.cell();
        if (!ctx || !ctx.column || !ctx.rowInfo) {
          return;
        }
        untracked(() => {
          const columnId = ctx.column.id;
          const rowId = ctx.rowInfo.id;
          const value = ctx.value;

          const previous = last;
          last = { columnId, rowId, value };

          const sameCell =
            !!previous &&
            previous.columnId === columnId &&
            previous.rowId === rowId;

          if (!sameCell) {
            // recycled to another cell - reset without flashing
            this.clear();
            this.oldValue.set(null);
            return;
          }

          if (value === previous.value) {
            return;
          }

          this.oldValue.set(previous.value);
          this.flash(value, previous.value);
        });
      });

      inject(DestroyRef).onDestroy(() => this.clear());
    }

    private getElement(): HTMLElement | null {
      return untracked(this.cell)?.htmlElementRef?.current ?? null;
    }

    private clear() {
      const el = this.getElement();

      if (this.flashTimeoutId) {
        clearTimeout(this.flashTimeoutId);
        this.flashTimeoutId = undefined;
      }

      if (this.flashDirection && el) {
        const internalflashCls =
          INTERNAL_FLASH_CLS_FOR_DIRECTION[this.flashDirection];

        el.classList.remove(
          ...(flashClassName
            ? [flashClassName, ...internalflashCls]
            : internalflashCls),
        );
        el.style.removeProperty(currentFlashingDurationVar);

        this.flashDirection = undefined;
      }
    }

    private flash(value: any, previousValue: any) {
      const el = this.getElement();
      if (!el) {
        return;
      }

      this.clear();

      const { flashingDurationCSSVarValue } = this.table.getState();
      const duration =
        typeof flashingDurationCSSVarValue === 'number'
          ? flashingDurationCSSVarValue ??
            FLASH_DURATION ??
            DEFAULT_FLASH_DURATION
          : FLASH_DURATION ?? DEFAULT_FLASH_DURATION;

      const direction: FlashDirection =
        typeof value === 'number'
          ? value > previousValue
            ? 'up'
            : 'down'
          : 'neutral';

      const internalflashCls = INTERNAL_FLASH_CLS_FOR_DIRECTION[direction];

      el.style.setProperty(currentFlashingDurationVar, `${duration}`);

      el.classList.add(
        ...(flashClassName
          ? [flashClassName, ...internalflashCls]
          : internalflashCls),
      );

      this.flashDirection = direction;
      this.flashTimeoutId = setTimeout(() => this.clear(), duration);
    }
  }

  return FlashingColumnCell;
}

/**
 * A `components.ColumnCell` override that flashes the cell when its value
 * changes (with the default options).
 */
export const FlashingColumnCell: Type<unknown> =
  createFlashingColumnCellComponent();
