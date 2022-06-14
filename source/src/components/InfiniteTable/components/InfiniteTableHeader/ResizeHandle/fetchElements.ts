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

function fetchColumnElementsWidthsAndTransformsForColumnIndex(
  colIndex: number,
) {
  const widths: number[] = [];
  const transforms: number[] = [];

  const elements = fetchElementsForColumnIndex(colIndex, (node) => {
    widths.push(parseInt(node.style.getPropertyValue(currentColumnWidth), 10));
    transforms.push(
      parseInt(node.style.getPropertyValue(currentColumnTransformX), 10),
    );
  });

  return {
    elements,
    widths,
    transforms,
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
  {
    totalColumns,
    shareSpaceOnResize,
  }: { totalColumns: number; shareSpaceOnResize: boolean },
) {
  const { elements: elementsToResize, widths: initialSizes } =
    fetchColumnElementsAndWidthsForColumnIndex(colIndex);

  let elementsToResize2: HTMLElement[] = [];
  let initialSizes2: number[] = [];
  let transforms2: number[] = [];

  if (shareSpaceOnResize) {
    const { elements, widths, transforms } =
      fetchColumnElementsWidthsAndTransformsForColumnIndex(colIndex + 1);
    elementsToResize2 = elements;
    initialSizes2 = widths;
    transforms2 = transforms;
  }

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

      if (shareSpaceOnResize) {
        elementsToResize2.forEach((el, index) => {
          el.style.setProperty(
            currentColumnWidth,
            initialSizes2[index] - diff + 'px',
          );
          el.style.setProperty(
            currentColumnTransformX,
            transforms2[index] + diff + 'px',
          );
        });
        return;
      }
      elementsToShift.forEach((el, index) => {
        el.style.setProperty(
          currentColumnTransformX,
          transforms[index] + diff + 'px',
        );
      });
    },
  };
}
