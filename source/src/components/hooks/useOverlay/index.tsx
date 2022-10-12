import * as React from 'react';
import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
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
import { propToIdentifyMenu } from '../../Menu/propToIdentifyMenu';
import { SubscriptionCallback } from '../../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { useRerender } from '../useRerender';

type OverlayParams = {
  portalContainer?: ElementContainerGetter | null | false;
  constrainTo?: OverlayShowParams['constrainTo'];
};

export type ElementContainerGetter =
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

export type AdvancedAlignable = Alignable | ElementContainerGetter;

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

  return target ? Rectangle.from(target) : null;
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

function DefaultOverlayPortal(props: { children: ReactNode }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0 }}>{props.children}</div>
  );
}

function OverlayContent(
  props: {
    children: () => ReactNode;
  } & OverlayHandle,
) {
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    return props.realign.onChange((handle) => {
      if (nodeRef.current && handle) {
        alignOverlayNode(nodeRef.current, handle);
      }
    });
  }, [props.realign]);

  return (
    <div
      style={{ position: 'absolute', top: 0, left: 0 }}
      ref={useCallback((node: HTMLDivElement) => {
        if (node) {
          alignOverlayNode(node, props);
          // const rect = alignOverlayNode(node, props);
          // const realignEvent = new CustomEvent('realign', {
          //   bubbles: true,
          //   detail: {
          //     rect,
          //   },
          // });

          // node.firstChild?.dispatchEvent(realignEvent);
        }
        nodeRef.current = node;
      }, [])}
    >
      {typeof props.children === 'function' ? props.children() : props.children}
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

/**
 * If portal container is given, it will create a React portal from that element
 * otherwise it will simply render another node as portal
 *
 * @param portalContainer
 */
export function useOverlayPortal(
  content: ReactNode,
  portalContainer?: ElementContainerGetter | null | false,
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
    ) : (
      // we're probably still fetching the container
      <></>
    )
  ) : portalContainer === null || portalContainer === false ? (
    content
  ) : (
    <DefaultOverlayPortal>{content}</DefaultOverlayPortal>
  );
}

export type OverlayShowParams = {
  id?: string | number;
  constrainTo?: AdvancedAlignable | boolean;
  alignPosition: AlignPositionOptions['alignPosition'];
  alignTo: AdvancedAlignable | PointCoords;
};

type OverlayHandle = {
  key: string;
  children: () => ReactNode;

  constrainTo: OverlayShowParams['constrainTo'];
  alignPosition: OverlayShowParams['alignPosition'];
  alignTo: OverlayShowParams['alignTo'];

  realign: SubscriptionCallback<OverlayHandle>;
};

function getIdForReactOnlyChild(children: ReactNode | (() => ReactNode)) {
  if (React.Children.count(children) === 1) {
    const child = React.Children.only(children);
    if (React.isValidElement(child)) {
      return child.props.id || child.key;
    }
  }
  return null;
}

function injectPortalContainerAndConstrainInMenuChild(
  children: ReactNode,
  portalContainer: OverlayParams['portalContainer'],
  constrainTo: OverlayParams['constrainTo'],
) {
  if (React.Children.count(children) === 1) {
    const child = React.Children.only(children);
    // here we could have tested for child.type === Menu,
    // but if we had done that, we could have had to import the `Menu` component
    // which in turns imports this, so we try to avoid that
    if (React.isValidElement(child) && child.props[propToIdentifyMenu]) {
      const newProps: Partial<OverlayParams> = {};
      if (child.props.portalContainer === undefined) {
        newProps.portalContainer = portalContainer;
      }
      if (child.props.constrainTo === undefined) {
        newProps.constrainTo = constrainTo;
      }
      return React.cloneElement(child, newProps);
    }
  }
  return children;
}

//@ts-ignore
globalThis.allhandles = {};
//@ts-ignore
globalThis.thehandles = {};

export function useOverlay(params: OverlayParams) {
  const rootParams = params;

  const [handles] = useState<Map<string, OverlayHandle>>(() => new Map());

  const [handleToRealign, setHandleToRealign] = useState<string | null>(null);
  const [realignTimestamp, setRealignTimestamp] = useState(0);

  const getContentForPortal = useCallback(() => {
    const contentForPortal: ReactNode[] = [];

    for (const [_, handle] of handles) {
      contentForPortal.push(
        <OverlayContent {...handle} key={handle.key}></OverlayContent>,
      );
    }

    return contentForPortal;
  }, []);

  const portal = useOverlayPortal(
    getContentForPortal(),
    params.portalContainer,
  );

  const [_, updateContent] = useRerender();

  const showOverlay = useCallback(
    (content: ReactNode | (() => ReactNode), params: OverlayShowParams) => {
      const id =
        params.id || getIdForReactOnlyChild(content) || getChangeDetect();
      const key = `${id}`;

      let handle = handles.get(key);

      const childrenFn = () => {
        const children = typeof content === 'function' ? content() : content;

        return injectPortalContainerAndConstrainInMenuChild(
          children,
          rootParams.portalContainer,
          params.constrainTo ?? rootParams.constrainTo,
        );
      };

      if (handle) {
        Object.assign(handle, params, { children: childrenFn });
        updateContent();
        setHandleToRealign(handle.key);
        setRealignTimestamp(Date.now());
        return;
      }

      handle = {
        key,
        children: childrenFn,
        alignPosition: params.alignPosition,
        alignTo: params.alignTo,
        constrainTo: params.constrainTo,
        realign: buildSubscriptionCallback<OverlayHandle>(),
      };

      handles.set(handle.key, handle);

      updateContent();

      return () => updateContent();
    },
    [handles, rootParams.portalContainer, updateContent],
  );

  React.useEffect(() => {
    if (handleToRealign) {
      const handle = handles.get(handleToRealign);
      if (handle) {
        handle.realign(handle);
      }
    }
  }, [handleToRealign, realignTimestamp]);

  const hideOverlay = (id: string) => {
    id = `${id}`;
    if (handles.has(id)) {
      handles.delete(id);
      updateContent();
    }
  };

  const clearAll = () => {
    handles.clear();
    updateContent();
  };

  React.useEffect(() => {
    // return clearAll;
  }, []);

  return {
    portal,
    hideOverlay,
    clearAll,
    rerenderOverlays: updateContent,
    showOverlay,
  };
}
