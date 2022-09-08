import * as React from 'react';
import { ReactNode, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Alignable,
  AlignPositionOptions,
  getAlignPosition,
} from '../../../utils/pageGeometry/alignment';

import type { PointCoords } from '../../../utils/pageGeometry/Point';
import type { RectangleCoords } from '../../../utils/pageGeometry/Rectangle';
import { Rectangle } from '../../../utils/pageGeometry/Rectangle';
import { getChangeDetect } from '../../DataSource/privateHooks/getChangeDetect';
import { SubscriptionCallback } from '../../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';

type OverlayParams = {
  portalContainer?: ElementContainerGetter;
};

type ElementContainerGetter =
  | (() => HTMLElement | string | Promise<HTMLElement | string>)
  | string
  | HTMLElement
  | Promise<HTMLElement | string>;

function isPromise<T extends any = any>(p: any): p is Promise<T> {
  return (p && typeof p.then === 'function') || p instanceof Promise;
}
function isHTMLElement(
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

type AdvancedAlignable = Alignable | ElementContainerGetter;

async function retrieveAdvancedAlignable(
  target: AdvancedAlignable,
): Promise<RectangleCoords | null> {
  if (typeof target === 'function') {
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

  return Rectangle.from(target);
}

async function retrieveElement(
  elementGetter: ElementContainerGetter,
): Promise<HTMLElement | null> {
  let result: HTMLElement | string | Promise<HTMLElement | string> | null =
    null;

  if (typeof elementGetter === 'function') {
    result = elementGetter();
  } else {
    result = elementGetter;
  }

  function assignPortal(result: HTMLElement | string | null) {
    let portalElement: HTMLElement | null = null;

    if (typeof result === 'string') {
      portalElement = document.querySelector(result)!;
    }
    if (isHTMLElement(result)) {
      portalElement = result;
    }

    return portalElement || null;
  }

  return assignPortal(await result);
}

function DefaultOverlayPortal(props: { children: ReactNode }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0 }}>{props.children}</div>
  );
}

function OverlayContent(
  props: {
    children: ReactNode;
  } & OverlayHandle,
) {
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    return props.realign.onChange((handle) => {
      if (nodeRef.current && handle) {
        alignOverlayNode(nodeRef.current, handle);
      }
    });
  }, [props.realign]);
  return (
    <div
      style={{ position: 'absolute', top: 0, left: 0 }}
      ref={(node) => {
        if (node) {
          alignOverlayNode(node, props);
        }
        nodeRef.current = node;
      }}
    >
      {props.children}
    </div>
  );
}

async function alignOverlayNode(
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
}

/**
 * If portal container is given, it will create a React portal form that element
 * otherwise it will simply render another node as portal
 *
 * @param portalContainer
 */
function useOverlayPortal(
  content: ReactNode,
  portalContainer?: ElementContainerGetter,
) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    async function getContainer() {
      const container = portalContainer
        ? await retrieveElement(portalContainer)
        : null;

      if (container != null) {
        setContainer(container);
      }
    }

    if (!portalContainer) {
      return;
    }
    getContainer();
  }, [portalContainer]);

  return portalContainer ? (
    container ? (
      createPortal(content, container)
    ) : null
  ) : (
    <DefaultOverlayPortal>{content}</DefaultOverlayPortal>
  );
}

type OverlayShowParams = {
  id?: string | number;
  constrainTo?: AdvancedAlignable | boolean;
  alignPosition: AlignPositionOptions['alignPosition'];
  alignTo: AdvancedAlignable | PointCoords;
};

type OverlayHandle = {
  id: string;
  children: ReactNode;
  alignPosition: OverlayShowParams['alignPosition'];
  alignTo: OverlayShowParams['alignTo'];
  constrainTo: OverlayShowParams['constrainTo'];
  realign: SubscriptionCallback<OverlayHandle>;
};

export function useOverlay(params: OverlayParams) {
  const [contentForPortal, setContentForPortal] = useState<ReactNode[]>([]);
  const [handles] = useState<Map<string, OverlayHandle>>(() => new Map());

  const portal = useOverlayPortal(contentForPortal, params.portalContainer);

  function updateContent() {
    const contentForPortal: ReactNode[] = [];

    for (const [_, handle] of handles) {
      contentForPortal.push(
        <OverlayContent key={handle.id} {...handle}></OverlayContent>,
      );
    }

    setContentForPortal(contentForPortal);
  }

  const showOverlay = (children: ReactNode, params: OverlayShowParams) => {
    const key = getChangeDetect();
    const id = `${params.id ?? key}`;

    let handle = handles.get(id);

    if (handle) {
      Object.assign(handle, params);
      handle.realign(handle);
      return;
    }

    handle = {
      id,
      children,
      alignPosition: params.alignPosition,
      alignTo: params.alignTo,
      constrainTo: params.constrainTo,
      realign: buildSubscriptionCallback<OverlayHandle>(),
    };

    handles.set(handle.id, handle);

    updateContent();

    return id;
  };

  const hideOverlay = (id: string) => {
    id = `${id}`;
    if (handles.has(id)) {
      handles.delete(id);
      updateContent();
    }
  };

  return {
    portal,
    hideOverlay,
    showOverlay,
  };
}
