import * as React from 'react';

import { useEffectWhen } from '../../../hooks/useEffectWhen';
import { useInfiniteColumnCell } from './InfiniteTableColumnCell';
import { join } from '../../../../utils/join';
import { FlashingColumnCellRecipe } from '../cell.css';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { InternalVars } from '../../internalVars.css';
import { stripVar } from '../../../../utils/stripVar';

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

      const {
        state: { flashingDurationCSSVarValue },
      } = useInfiniteTable();

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

      const flashTimeoutIdRef = React.useRef<any>();
      const fadeTimeoutIdRef = React.useRef<any>();

      useEffectWhen(
        () => {
          if (value === oldValueRef.current) {
            return;
          }
          if (flashTimeoutIdRef.current) {
            clearTimeout(flashTimeoutIdRef.current);
          }
          if (fadeTimeoutIdRef.current) {
            clearTimeout(fadeTimeoutIdRef.current);
          }

          const el = htmlElementRef.current;

          oldValueRef.current = value;

          if (!el) {
            return;
          }

          const flashDirection =
            typeof value === 'number'
              ? value > oldValue
                ? 'up'
                : 'down'
              : 'neutral';

          const internalflashCls = FlashingColumnCellRecipe({
            direction: flashDirection,
          }).split(' ');

          el.style.setProperty(currentFlashingDurationVar, `${duration}`);
          if (flashClassName) {
            el.classList.add(flashClassName);
          }

          el.classList.add(...internalflashCls);

          flashTimeoutIdRef.current = setTimeout(() => {
            flashTimeoutIdRef.current = undefined;

            if (flashClassName) {
              el.classList.remove(flashClassName);
            }
            el.classList.remove(...internalflashCls);
            el.style.removeProperty(currentFlashingDurationVar);
            // if (!fadeDuration || !fadeClassName) {
            //   return;
            // }

            // el.classList.add(fadeClassName);

            // fadeTimeoutIdRef.current = setTimeout(() => {
            //   el.classList.remove(fadeClassName);
            //   fadeTimeoutIdRef.current = undefined;
            // }, fadeDuration);
          }, duration);

          return () => {
            if (flashTimeoutIdRef.current) {
              clearTimeout(flashTimeoutIdRef.current);
            }
            if (fadeTimeoutIdRef.current) {
              clearTimeout(fadeTimeoutIdRef.current);
            }
          };
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
