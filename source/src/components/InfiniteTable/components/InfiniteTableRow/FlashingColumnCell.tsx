import * as React from 'react';

import { useEffectWhen } from '../../../hooks/useEffectWhen';
import { useInfiniteColumnCell } from './InfiniteTableColumnCell';
import { join } from '../../../../utils/join';
import { FlashingColumnCellRecipe } from '../cell.css';
import { InternalVars } from '../../internalVars.css';
import { stripVar } from '../../../../utils/stripVar';
import { useInfiniteTableSelector } from '../../hooks/useInfiniteTableSelector';

export type FlashingCellOptions = {
  flashDuration?: number;
  // fadeDuration?: number;
  flashClassName?: string;
  // fadeClassName?: string;
  render?: (props: {
    children: React.ReactNode;
    oldValue: any;
  }) => React.ReactNode;
};

const currentFlashingDurationVar = stripVar(
  InternalVars.currentFlashingDuration,
);

const defaultRender: FlashingCellOptions['render'] = ({ children }) => {
  return <>{children}</>;
};

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
    // fadeDuration,
    flashClassName,
    // fadeClassName,
    render = defaultRender,
  } = options;

  const FlashingColumnCell = React.forwardRef(
    (
      props: React.HTMLProps<HTMLDivElement>,
      _ref: React.Ref<HTMLDivElement>,
    ) => {
      const cellContext = useInfiniteColumnCell<any>();

      const { flashingDurationCSSVarValue } = useInfiniteTableSelector(
        (ctx) => {
          return {
            flashingDurationCSSVarValue: ctx.state.flashingDurationCSSVarValue,
          };
        },
      );

      const duration =
        typeof flashingDurationCSSVarValue === 'number'
          ? flashingDurationCSSVarValue ??
            FLASH_DURATION ??
            DEFAULT_FLASH_DURATION
          : FLASH_DURATION ?? DEFAULT_FLASH_DURATION;

      const { domRef, value, column, rowInfo, htmlElementRef } = cellContext;

      const rowId = rowInfo.id;
      const columnId = column.id;

      const initialRef = React.useRef(true);
      const oldValueRef = React.useRef(value);
      const oldValue = initialRef.current ? null : oldValueRef.current;

      initialRef.current = false;

      const flashTimeoutIdRef = React.useRef<any>(undefined);
      const flashDirectionRef = React.useRef<FlashDirection | undefined>(
        undefined,
      );
      const fadeTimeoutIdRef = React.useRef<any>(undefined);

      useEffectWhen(
        () => {
          if (value === oldValueRef.current) {
            return;
          }

          const clear = () => {
            const el = htmlElementRef.current;

            if (flashTimeoutIdRef.current) {
              clearTimeout(flashTimeoutIdRef.current);
              flashTimeoutIdRef.current = undefined;
            }
            if (fadeTimeoutIdRef.current) {
              clearTimeout(fadeTimeoutIdRef.current);
              fadeTimeoutIdRef.current = undefined;
            }

            if (flashDirectionRef.current && el) {
              const flashDirection = flashDirectionRef.current;

              const internalflashCls =
                INTERNAL_FLASH_CLS_FOR_DIRECTION[flashDirection];

              el.classList.remove(
                ...(flashClassName
                  ? [flashClassName, ...internalflashCls]
                  : internalflashCls),
              );
              el.style.removeProperty(currentFlashingDurationVar);

              flashDirectionRef.current = undefined;
            }
          };

          oldValueRef.current = value;

          const el = htmlElementRef.current;
          if (!el) {
            return;
          }

          clear();

          const flashDirection: FlashDirection =
            typeof value === 'number'
              ? value > oldValue
                ? 'up'
                : 'down'
              : 'neutral';

          const internalflashCls =
            INTERNAL_FLASH_CLS_FOR_DIRECTION[flashDirection];

          el.style.setProperty(currentFlashingDurationVar, `${duration}`);

          el.classList.add(
            ...(flashClassName
              ? [flashClassName, ...internalflashCls]
              : internalflashCls),
          );

          flashDirectionRef.current = flashDirection;
          flashTimeoutIdRef.current = setTimeout(clear, duration);

          return clear;
        },
        {
          same: [columnId, rowId],
          different: [value],
        },
      );

      return (
        <div ref={domRef} {...props} className={join(props.className)}>
          {render({ children: props.children, oldValue })}
        </div>
      );
    },
  );

  return FlashingColumnCell;
};

export const FlashingColumnCell = createFlashingColumnCellComponent();
