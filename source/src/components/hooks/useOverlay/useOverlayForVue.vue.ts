/**
 * Vue sibling of the useOverlay hook (index.tsx): positioned overlays
 * (menus, tooltips) rendered through a portal (Vue Teleport) or inline.
 *
 * All geometry/alignment logic is shared (overlayUtils.ts) — this file owns
 * the Vue scheduling: a shallowRef Map of overlay handles, a component that
 * renders + aligns them, and Teleport-based portal containment.
 */
import {
  Teleport,
  cloneVNode,
  defineComponent,
  h,
  isVNode,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  triggerRef,
  watch,
} from 'vue';
import type { PropType, VNode, VNodeChild } from 'vue';

import { getChangeDetect } from '../../DataSource/privateHooks/getChangeDetect';
import { propToIdentifyMenu } from '../../Menu/propToIdentifyMenu';
import { SubscriptionCallback } from '../../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';

import {
  alignNode,
  retrieveElement,
  type ElementContainerGetter,
  type OverlayShowParams,
} from './overlayUtils';

export type { OverlayShowParams, ElementContainerGetter };

type OverlayParams = {
  portalContainer?: ElementContainerGetter | null | false;
  constrainTo?: OverlayShowParams['constrainTo'];
};

type OverlayHandle = {
  key: string;
  children: () => VNodeChild;

  constrainTo: OverlayShowParams['constrainTo'];
  alignPosition: OverlayShowParams['alignPosition'];
  alignTo: OverlayShowParams['alignTo'];

  realign: SubscriptionCallback<OverlayHandle>;
};

export type UpdateOverlayContentFn = (
  content: VNodeChild | (() => VNodeChild),
  options?: { skipRealign?: boolean },
) => void;

export type ShowOverlayFn = (
  content: VNodeChild | (() => VNodeChild),
  params: OverlayShowParams,
) => UpdateOverlayContentFn;

/**
 * Renders one overlay handle: an absolutely positioned wrapper that aligns
 * itself (via the shared alignNode) on mount and whenever handle.realign
 * fires.
 */
const OverlayContent = defineComponent({
  name: 'OverlayContent',
  props: {
    handle: { type: Object as PropType<OverlayHandle>, required: true },
  },
  setup(props) {
    let node: HTMLDivElement | null = null;

    const refFn = (el: any) => {
      if (el && el !== node) {
        alignNode(el as HTMLDivElement, props.handle);
      }
      node = (el as HTMLDivElement) ?? null;
    };

    let removeOnRealign: VoidFunction | null = null;
    const wireRealign = (handle: OverlayHandle) => {
      removeOnRealign?.();
      removeOnRealign = handle.realign.onChange((h) => {
        if (node && h) {
          alignNode(node, h);
        }
      });
    };

    onMounted(() => wireRealign(props.handle));
    watch(() => props.handle, wireRealign);
    onBeforeUnmount(() => {
      removeOnRealign?.();
    });

    return () =>
      h(
        'div',
        {
          style: { position: 'absolute', top: '0px', left: '0px' },
          ref: refFn,
        },
        [props.handle.children()],
      );
  },
});

function getIdForVNodeOnlyChild(content: VNodeChild | (() => VNodeChild)) {
  if (isVNode(content)) {
    return (content.props as any)?.id || content.key;
  }
  return null;
}

/**
 * mirrors injectPortalContainerAndConstrainInMenuChild: when the overlay
 * content is a single Menu vnode, inject the portalContainer + constrainTo
 * props unless already given
 */
function injectPortalContainerAndConstrainInMenuChild(
  children: VNodeChild,
  portalContainer: OverlayParams['portalContainer'],
  constrainTo: OverlayParams['constrainTo'],
): VNodeChild {
  if (isVNode(children) && (children.type as any)?.[propToIdentifyMenu]) {
    const newProps: Record<string, any> = {};
    if ((children.props as any)?.portalContainer === undefined) {
      newProps.portalContainer = portalContainer;
    }
    if ((children.props as any)?.constrainTo === undefined) {
      newProps.constrainTo = constrainTo;
    }
    return cloneVNode(children as VNode, newProps);
  }
  return children;
}

export function useOverlay(params: OverlayParams) {
  const rootParams = params;

  const handles = new Map<string, OverlayHandle>();
  // bumping this ref is the Vue equivalent of React's useRerender
  const handlesRef = shallowRef(handles);
  const updateContent = () => triggerRef(handlesRef);

  const showOverlay: ShowOverlayFn = (content, params) => {
    const id =
      params.id || getIdForVNodeOnlyChild(content) || getChangeDetect();
    const key = `${id}`;

    let handle = handles.get(key);

    const getChildrenFnForContent = (
      content: VNodeChild | (() => VNodeChild),
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

    const updateOverlay: UpdateOverlayContentFn = (overlayContent, options) => {
      if (!handle) {
        return;
      }
      const childrenFn = getChildrenFnForContent(overlayContent);

      Object.assign(handle, { children: childrenFn });
      updateContent();

      const skipRealign = !!options?.skipRealign;
      if (!skipRealign) {
        // realign after the content re-renders. nextTick (not raf) so the
        // realign lands in the same task as the update - the same timing as
        // React's useEffect-based realign
        nextTick(() => {
          if (handle && handles.get(handle.key) === handle) {
            handle.realign(handle);
          }
        });
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
  };

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

  /**
   * The component the caller renders in its tree (the equivalent of the
   * `portal` ReactNode returned by the React hook).
   */
  const OverlayPortal = defineComponent({
    name: 'OverlayPortal',
    setup() {
      const containerRef = shallowRef<HTMLElement | null>(null);
      const { portalContainer } = rootParams;

      if (portalContainer) {
        (async () => {
          const container = await retrieveElement(portalContainer);
          if (container != null) {
            containerRef.value = container;
          }
        })();
      }

      return () => {
        const contentForPortal: VNodeChild[] = [];
        for (const [_, handle] of handlesRef.value) {
          contentForPortal.push(h(OverlayContent, { handle, key: handle.key }));
        }

        if (portalContainer) {
          return containerRef.value
            ? h(Teleport, { to: containerRef.value }, contentForPortal)
            : null;
        }

        if (portalContainer === null || portalContainer === false) {
          return contentForPortal;
        }

        // default: fixed wrapper (DefaultOverlayPortal in React)
        return h(
          'div',
          { style: { position: 'fixed', top: '0px', left: '0px' } },
          contentForPortal,
        );
      };
    },
  });

  return {
    portal: OverlayPortal,
    hideOverlay,
    clearAll,
    rerenderOverlays: updateContent,
    showOverlay,
  };
}
