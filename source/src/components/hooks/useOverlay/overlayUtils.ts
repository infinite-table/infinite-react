import {
  Alignable,
  AlignPositionOptions,
  getAlignPosition,
} from '../../../utils/pageGeometry/alignment';

import type { PointCoords } from '../../../utils/pageGeometry/Point';
import type { RectangleCoords } from '../../../utils/pageGeometry/Rectangle';
import { Rectangle } from '../../../utils/pageGeometry/Rectangle';

export type ElementContainerGetter =
  | (() => HTMLElement | string | Promise<HTMLElement | string>)
  | string
  | HTMLElement
  | Promise<HTMLElement | string>;

export function isPromise<T extends any = any>(p: any): p is Promise<T> {
  return (p && typeof p.then === 'function') || p instanceof Promise;
}

export function isHTMLElement(
  el: null | string | HTMLElement | Promise<any> | any,
): el is HTMLElement {
  if (el == null) {
    return false;
  }
  if (typeof el === 'string') {
    return false;
  }
  //@ts-ignore
  return typeof el.tagName === 'string';
}

export type AdvancedAlignable = Alignable | ElementContainerGetter;

export type OverlayShowParams = {
  id?: string | number;
  constrainTo?: AdvancedAlignable | boolean;
  alignPosition: AlignPositionOptions['alignPosition'];
  alignTo: AdvancedAlignable | PointCoords;
};

export async function retrieveAdvancedAlignable(
  target: AdvancedAlignable,
): Promise<RectangleCoords | null> {
  if (typeof target === 'function') {
    //@ts-ignore
    target = target();
  }

  if (isPromise(target)) {
    target = await target;
  }
  if (typeof target === 'string') {
    target = document.querySelector(target) as HTMLElement;
  }
  if (target && isHTMLElement(target)) {
    target = target.getBoundingClientRect();
  }

  //@ts-ignore
  return target ? Rectangle.from(target) : null;
}

export async function retrieveElement(
  elementGetter: ElementContainerGetter,
): Promise<HTMLElement | null> {
  let result: HTMLElement | string | Promise<HTMLElement | string> | null =
    null;

  if (typeof elementGetter === 'function') {
    //@ts-ignore
    result = elementGetter();
  } else {
    result = elementGetter;
  }

  function queryForElement(result: HTMLElement | string | null) {
    let el: HTMLElement | null = null;

    if (typeof result === 'string') {
      el = document.querySelector(result)!;
    }
    if (isHTMLElement(result)) {
      el = result;
    }

    return el || null;
  }

  return queryForElement(await result);
}

export async function alignNode(
  node: HTMLDivElement,
  params: OverlayShowParams,
) {
  let { constrainTo, alignTo, alignPosition } = params;

  if (
    Object.keys(alignTo).length === 2 &&
    (alignTo as PointCoords).top !== undefined &&
    (alignTo as PointCoords).left !== undefined
  ) {
    alignTo = {
      ...(alignTo as PointCoords),
      width: 0,
      height: 0,
    } as RectangleCoords;
  }
  if (typeof constrainTo === 'boolean') {
    constrainTo = constrainTo
      ? document.documentElement.getBoundingClientRect()
      : undefined;
  }
  const constrainToRectangle = constrainTo
    ? (await retrieveAdvancedAlignable(constrainTo)) || undefined
    : undefined;

  const alignToRectangle = alignTo
    ? await retrieveAdvancedAlignable(alignTo as AdvancedAlignable)
    : undefined;
  const alignTarget = Rectangle.from(node.getBoundingClientRect());

  if (!alignToRectangle) {
    return;
  }

  const { alignedRect } = getAlignPosition({
    constrainTo: constrainToRectangle,
    alignAnchor: alignToRectangle,
    alignTarget,
    alignPosition,
  });

  node.style.transform = `translate3d(${alignedRect.left}px,${alignedRect.top}px, 0px)`;

  const rect = node.getBoundingClientRect();

  if (rect.left !== alignedRect.left || rect.top !== alignedRect.top) {
    // let's take the diff from offsetParent to the alignRect
    // and adjust it like that
    const offsetParent = node.offsetParent as HTMLElement;

    if (offsetParent) {
      const offsetParentRect = offsetParent.getBoundingClientRect();
      const offsetParentLeft = offsetParentRect.left;
      const offsetParentTop = offsetParentRect.top;

      const leftDiff = alignedRect.left - offsetParentLeft;
      const topDiff = alignedRect.top - offsetParentTop;

      node.style.transform = `translate3d(${leftDiff}px,${topDiff}px, 0px)`;
    }
  }
}
