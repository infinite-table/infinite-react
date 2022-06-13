import { stripVar } from '../../../../../utils/stripVar';
import { InternalVars } from '../../../theme.css';

function fetchElementsForColumnIndex(
  colIndex: number,
  callback?: (node: HTMLElement) => void,
) {
  const result: HTMLElement[] = [];
  const nodeList = document.querySelectorAll(`[data-col-index="${colIndex}"]`);

  result.length = nodeList.length;

  nodeList.forEach((el, index) => {
    const node = el as HTMLElement;
    callback?.(node);
    result[index] = node;
  });

  return result;
}

function fetchColumnElementsAndWidthsForColumnIndex(colIndex: number) {
  const widths: number[] = [];

  const elements = fetchElementsForColumnIndex(colIndex, (node) => {
    widths.push(parseInt(node.style.getPropertyValue(currentColumnWidth), 10));
  });

  return {
    elements,
    widths,
  };
}

const currentColumnTransformX = stripVar(InternalVars.currentColumnTransformX);
const currentColumnWidth = stripVar(InternalVars.currentColumnWidth);

export function fetchColumnElementsAndTransforms(
  startIndex: number,
  stopIndex: number,
) {
  const elements: HTMLElement[] = [];
  const transforms: number[] = [];

  for (let i = startIndex; i < stopIndex; i++) {
    fetchElementsForColumnIndex(i, (node) => {
      transforms.push(
        parseInt(node.style.getPropertyValue(currentColumnTransformX), 10),
      );
      elements.push(node);
    });
  }

  return { elements, transforms };
}

export function getResizer(
  colIndex: number,
  { totalColumns }: { totalColumns: number },
) {
  const { elements: elementsToResize, widths: initialSizes } =
    fetchColumnElementsAndWidthsForColumnIndex(colIndex);

  const { elements: elementsToShift, transforms } =
    fetchColumnElementsAndTransforms(colIndex + 1, totalColumns);
  return {
    resize(diff: number) {
      elementsToResize.forEach((el, index) => {
        el.style.setProperty(
          currentColumnWidth,
          initialSizes[index] + diff + 'px',
        );
      });

      elementsToShift.forEach((el, index) => {
        el.style.setProperty(
          currentColumnTransformX,
          transforms[index] + diff + 'px',
        );
      });
    },
  };
}
