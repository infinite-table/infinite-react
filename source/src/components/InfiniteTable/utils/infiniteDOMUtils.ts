import { selectParent } from '../../../utils/selectParent';
import { stripVar } from '../../../utils/stripVar';
import { ScrollPosition } from '../../types/ScrollPosition';
import { internalProps } from '../internalProps';
import { InternalVars, ThemeVars } from '../theme.css';
import { InfiniteTableComputedColumn } from '../types';

const InfiniteSelector = `.${internalProps.rootClassName}`;
export function getParentInfiniteNode(node: HTMLElement) {
  return selectParent(node, InfiniteSelector);
}

const scrollLeft = stripVar(InternalVars.scrollLeft);
const scrollTop = stripVar(InternalVars.scrollTop);

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnOffsetAtIndex = stripVar(InternalVars.columnOffsetAtIndex);
const columnReorderEffectDurationAtIndex = stripVar(
  InternalVars.columnReorderEffectDurationAtIndex,
);
const columnOffsetAtIndexWhileReordering = stripVar(
  InternalVars.columnOffsetAtIndexWhileReordering,
);
const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

export function setInfiniteVarOnRoot(
  varName: keyof typeof InternalVars | string,
  varValue: string | number,
  node: HTMLElement | null,
) {
  const infinite = node
    ? getParentInfiniteNode(node)
    : (document.querySelector(InfiniteSelector) as HTMLElement);

  setInfiniteVarOnNode(varName, varValue, infinite);
}

export function setInfiniteVarOnNode(
  varName: keyof typeof InternalVars | string,
  varValue: string | number,
  node: HTMLElement | null,
) {
  if (node) {
    const prop = InternalVars[varName as keyof typeof InternalVars]
      ? stripVar(InternalVars[varName as keyof typeof InternalVars])
      : varName;

    node.style.setProperty(prop, `${varValue}`);
  }
}

export function setInfiniteVarsOnRoot(
  vars: Partial<Record<keyof typeof InternalVars | string, string | number>>,
  node: HTMLElement | null,
) {
  const infinite = node
    ? getParentInfiniteNode(node)
    : (document.querySelector(InfiniteSelector) as HTMLElement);

  setInfiniteVarsOnNode(vars, infinite);
}

export function setInfiniteVarsOnNode(
  vars: Partial<Record<keyof typeof InternalVars, string | number>>,
  node: HTMLElement | null,
) {
  if (node) {
    for (var varName in vars) {
      node.style.setProperty(
        InternalVars[varName as keyof typeof InternalVars]
          ? stripVar(InternalVars[varName as keyof typeof InternalVars])
          : varName,
        `${vars[varName as keyof typeof InternalVars]}`,
      );
    }
  }
}

export function setInfiniteColumnWidth(
  colIndex: number,
  colWidth: number | string,
  node: HTMLElement | null,
) {
  setInfiniteVarOnRoot(
    `${columnWidthAtIndex}-${colIndex}`,
    typeof colWidth === 'number' ? colWidth + 'px' : colWidth,
    node,
  );
}

export function setInfiniteColumnOffset(
  colIndex: number,
  colOffset: number | string,
  node: HTMLElement | null,
) {
  setInfiniteVarOnRoot(
    `${columnOffsetAtIndex}-${colIndex}`,
    typeof colOffset === 'number' ? colOffset + 'px' : colOffset,
    node,
  );
}

export function addToInfiniteColumnOffset<T>(
  column: InfiniteTableComputedColumn<T>,
  amountToAdd: number,
  node: HTMLElement | null,
) {
  setInfiniteVarOnRoot(
    `${columnOffsetAtIndex}-${column.computedVisibleIndex}`,
    !column.computedPinned
      ? `${column.computedAbsoluteOffset + amountToAdd}px`
      : `calc( ${
          column.computedAbsoluteOffset + amountToAdd
        }px + var(${scrollLeft}))`,

    node,
  );
}

export function setInfiniteColumnZIndex(
  colIndex: number,
  colZIndex: number | string,
  node: HTMLElement | null,
) {
  setInfiniteVarOnRoot(
    `${columnZIndexAtIndex}-${colIndex}`,
    `${colZIndex}`,
    node,
  );
}

export function setInfiniteColumnOffsetWhileReordering(
  colIndex: number,
  offset: string | number,
  node: HTMLElement | null,
) {
  setInfiniteVarOnRoot(
    `${columnOffsetAtIndexWhileReordering}-${colIndex}`,
    typeof offset === 'number'
      ? `calc( var(${columnOffsetAtIndex}-${colIndex}) + ${offset}px )`
      : offset,
    node,
  );
}

export function clearInfiniteColumnReorderDuration(
  colIndex: number,
  node: HTMLElement | null,
  defaultValue?: string,
) {
  setInfiniteVarOnRoot(
    `${columnReorderEffectDurationAtIndex}-${colIndex}`,
    defaultValue ?? '',
    node,
  );
}

export function restoreInfiniteColumnReorderDuration(
  colIndex: number,
  node: HTMLElement | null,
) {
  const varName = `${columnReorderEffectDurationAtIndex}-${colIndex}`;

  setInfiniteVarOnRoot(
    varName,
    ThemeVars.components.Cell.reorderEffectDuration,
    node,
  );
}

export function getCSSVarNameForColWidth(colIndex: number) {
  return `${columnWidthAtIndex}-${colIndex}`;
}
export function getCSSVarNameForColOffset(colIndex: number) {
  return `${columnOffsetAtIndex}-${colIndex}`;
}

export function setInfiniteScrollPosition(
  scrollPosition: ScrollPosition,
  node: HTMLElement | null,
) {
  setInfiniteVarsOnNode(
    {
      [scrollLeft]: `${scrollPosition.scrollLeft}px`,
      [scrollTop]: `${scrollPosition.scrollTop}px`,
    },
    node,
  );
}
