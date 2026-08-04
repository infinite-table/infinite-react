/**
 * Vue sibling of FlashingColumnCell.tsx - a custom ColumnCell component
 * (usable via column.components.ColumnCell) that flashes the cell whenever
 * the cell value changes.
 *
 * The flash is applied imperatively (classList + a CSS var for the
 * duration), exactly like the React version - only the change detection is
 * adapted: instead of useEffectWhen({ same: [columnId, rowId], different:
 * [value] }) we watch the cell render param and compare manually.
 */
import { defineComponent, h, watch } from 'vue';
import type { VNodeChild } from 'vue';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { InternalVars } from '../../internalVars.css';
import { FlashingColumnCellRecipe } from '../cell.css';

import { useInfiniteColumnCell } from './InfiniteTableColumnCellForVue.vue';
import { useInfiniteTableContext } from '../../InfiniteTableContextForVue.vue';

export type FlashingCellOptions = {
  flashDuration?: number;
  flashClassName?: string;
  render?: (props: { children: VNodeChild; oldValue: any }) => VNodeChild;
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

export const createFlashingColumnCellComponent = (
  options: FlashingCellOptions = {},
) => {
  const {
    flashDuration: FLASH_DURATION,
    flashClassName,
    render = defaultRender,
  } = options;

  return defineComponent({
    name: 'FlashingColumnCell',
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      const cellContextRef = useInfiniteColumnCell<any>();
      const tableContext = useInfiniteTableContext();

      let initial = true;
      let oldValue: any = null;
      let lastSeenValue: any = cellContextRef.value?.value;

      let flashTimeoutId: any = undefined;
      let flashDirection: FlashDirection | undefined = undefined;

      const clear = () => {
        const el = cellContextRef.value?.htmlElementRef.current;

        if (flashTimeoutId) {
          clearTimeout(flashTimeoutId);
          flashTimeoutId = undefined;
        }

        if (flashDirection && el) {
          const internalflashCls =
            INTERNAL_FLASH_CLS_FOR_DIRECTION[flashDirection];

          el.classList.remove(
            ...(flashClassName
              ? [flashClassName, ...internalflashCls]
              : internalflashCls),
          );
          el.style.removeProperty(currentFlashingDurationVar);

          flashDirection = undefined;
        }
      };

      const flash = (value: any, previousValue: any) => {
        const el = cellContextRef.value?.htmlElementRef.current;
        if (!el) {
          return;
        }

        clear();

        const { flashingDurationCSSVarValue } = tableContext.getState();
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

        flashDirection = direction;
        flashTimeoutId = setTimeout(clear, duration);
      };

      // mirrors useEffectWhen({ same: [columnId, rowId], different: [value] }):
      // flash only when the value changed for the same cell (same column +
      // row) - when the cell is recycled for another row, just resync
      watch(
        () => {
          const ctx = cellContextRef.value;
          return ctx
            ? ([ctx.column.id, ctx.rowInfo.id, ctx.value] as const)
            : null;
        },
        (current, previous) => {
          if (!current) {
            return;
          }
          const [columnId, rowId, value] = current;
          const [prevColumnId, prevRowId] = previous ?? [];

          const sameCell = columnId === prevColumnId && rowId === prevRowId;

          if (!sameCell) {
            // recycled to another cell - reset without flashing
            clear();
            initial = true;
            oldValue = null;
            lastSeenValue = value;
            return;
          }

          if (value === lastSeenValue) {
            return;
          }

          initial = false;
          oldValue = lastSeenValue;
          lastSeenValue = value;

          flash(value, oldValue);
        },
        { flush: 'post' },
      );

      return () => {
        const ctx = cellContextRef.value;

        return h(
          'div',
          {
            ...attrs,
            class: join(attrs.class as string),
            ref: ctx?.domRef as any,
          },
          [
            render({
              children: slots.default ? slots.default() : null,
              oldValue: initial ? null : oldValue,
            }),
          ],
        );
      };
    },
  });
};

export const FlashingColumnCell = createFlashingColumnCellComponent();
