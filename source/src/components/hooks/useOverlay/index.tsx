import * as React from 'react';
import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { getChangeDetect } from '../../DataSource/privateHooks/getChangeDetect';
import { propToIdentifyMenu } from '../../Menu/propToIdentifyMenu';
import { SubscriptionCallback } from '../../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { useRerender } from '../useRerender';

import {
  alignNode,
  retrieveElement,
  type AdvancedAlignable,
  type ElementContainerGetter,
  type OverlayShowParams,
} from './overlayUtils';

export { alignNode };
export type { AdvancedAlignable, ElementContainerGetter, OverlayShowParams };

type OverlayParams = {
  portalContainer?: ElementContainerGetter | null | false;
  constrainTo?: OverlayShowParams['constrainTo'];
};

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
        alignNode(nodeRef.current, handle);
      }
    });
  }, [props.realign]);

  return (
    <div
      style={{ position: 'absolute', top: 0, left: 0 }}
      ref={useCallback((node: HTMLDivElement) => {
        if (node) {
          alignNode(node, props);
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
      //@ts-ignore
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
    if (
      React.isValidElement(child) &&
      (child.type as any)[propToIdentifyMenu]
    ) {
      const newProps: Partial<OverlayParams> = {};
      //@ts-ignore
      if (child.props.portalContainer === undefined) {
        newProps.portalContainer = portalContainer;
      }
      //@ts-ignore
      if (child.props.constrainTo === undefined) {
        newProps.constrainTo = constrainTo;
      }
      return React.cloneElement(child, newProps);
    }
  }
  return children;
}

// //@ts-ignore
// globalThis.allhandles = {};
// //@ts-ignore
// globalThis.thehandles = {};

export type UpdateOverlayContentFn = (
  content: ReactNode | (() => ReactNode),
  options?: { skipRealign?: boolean },
) => void;

export type ShowOverlayFn = (
  content: ReactNode | (() => ReactNode),
  params: OverlayShowParams,
) => UpdateOverlayContentFn;

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

  const [_, updateContent] = useRerender();

  const portal = useOverlayPortal(
    getContentForPortal(),
    params.portalContainer,
  );

  const showOverlay: ShowOverlayFn = useCallback(
    (content: ReactNode | (() => ReactNode), params: OverlayShowParams) => {
      const id =
        params.id || getIdForReactOnlyChild(content) || getChangeDetect();
      const key = `${id}`;

      let handle = handles.get(key);

      const getChildrenFnForContent = (
        content: ReactNode | (() => ReactNode),
      ) => {
        return () => {
          const children = typeof content === 'function' ? content() : content;

          return injectPortalContainerAndConstrainInMenuChild(
            children,
            rootParams.portalContainer,
            params.constrainTo ?? rootParams.constrainTo,
          );
        };
      };

      const childrenFn = getChildrenFnForContent(content);

      const updateOverlay: UpdateOverlayContentFn = (
        overlayContent,
        options,
      ) => {
        if (!handle) {
          return;
        }
        const childrenFn = getChildrenFnForContent(overlayContent);

        Object.assign(handle, { children: childrenFn });
        updateContent();
        const skipRealign = !!options?.skipRealign;
        const shouldRealign = !skipRealign;

        if (shouldRealign) {
          setHandleToRealign(handle.key);
          setRealignTimestamp(Date.now());
        }
      };

      if (handle) {
        Object.assign(handle, params);
        updateOverlay(content);
        return updateOverlay;
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

      return updateOverlay;
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
