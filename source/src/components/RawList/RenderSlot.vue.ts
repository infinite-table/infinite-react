import {
  defineComponent,
  getCurrentInstance,
  isVNode,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  shallowRef,
  watch,
  PropType,
} from 'vue';
import type { ComponentInternalInstance, VNodeChild } from 'vue';

/**
 * Content pushed through the updater is created imperatively (the shared
 * GridRenderer calls renderCell outside any component render function), so
 * those vnodes have no "ref owner" — Vue would then skip calling their
 * function refs (warning: "Missing ref owner context") and the cells'
 * domRef/onMount plumbing would never fire.
 *
 * We adopt the RenderSlot instance as the owner for such orphan refs. This
 * touches the internal `ref.i` field of the vnode (stable across Vue 3), and
 * only when the vnode has a ref with no owner.
 */
function adoptRefOwner(
  content: unknown,
  instance: ComponentInternalInstance | null,
): void {
  if (!instance || !content) {
    return;
  }
  if (Array.isArray(content)) {
    for (const child of content) {
      adoptRefOwner(child, instance);
    }
    return;
  }
  if (isVNode(content)) {
    const ref = content.ref as { i: ComponentInternalInstance | null } | null;
    if (ref && ref.i == null) {
      ref.i = instance;
    }
  }
}

import type { Renderable } from '../types/Renderable';
import type { SubscriptionCallback } from '../types/SubscriptionCallback';

/**
 * Vue sibling of AvoidReactDiff: an isolated render slot driven by a
 * SubscriptionCallback instead of parent re-renders.
 *
 * The updater pushes new content imperatively; only this component's subtree
 * re-renders (a shallowRef swap), so the grid can update thousands of cells
 * without ever diffing the parent tree — the exact same architecture the
 * React implementation uses, expressed with Vue's per-component reactivity.
 */
export const RenderSlot = defineComponent({
  name: 'RenderSlot',
  props: {
    name: { type: String, required: false },
    useraf: { type: Boolean, required: false, default: false },
    updater: {
      // a SubscriptionCallback is a callable with methods attached
      type: Function as PropType<SubscriptionCallback<Renderable>>,
      required: true,
    },
    afterCommit: { type: Function as PropType<() => void>, required: false },
  },
  setup(props) {
    // shallowRef: the content is an opaque (VNode) tree that must never be
    // deeply observed — reference swap is the only reactivity we want
    const children = shallowRef<Renderable | null>(props.updater.get() ?? null);

    let rafId: number | null = null;

    // Subscribe synchronously (not in onMounted) so updates fired between
    // initial render and mount are not lost — mirrors the React version,
    // which uses useLayoutEffect for the same reason.
    watch(
      () => [props.updater, props.useraf] as const,
      ([updater, useraf], _prev, onCleanup) => {
        children.value = updater.get() ?? null;

        const off = updater.onChange((content) => {
          if (useraf) {
            if (rafId != null) {
              cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(() => {
              children.value = content;
            });
          } else {
            children.value = content;
          }
        });

        onCleanup(off);
      },
      { immediate: true, flush: 'sync' },
    );

    onBeforeUnmount(() => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
    });

    // Fires after Vue patches this component's DOM — the closest equivalent
    // of React's useLayoutEffect-after-commit. Used to sync direct DOM work
    // (like transforms) with the framework's commit cycle.
    onMounted(() => props.afterCommit?.());
    onUpdated(() => props.afterCommit?.());

    const instance = getCurrentInstance();

    // Renderable is currently typed via the React node type (it gains
    // framework-sibling types later); at runtime under Vue the content IS a
    // VNode tree, so the cast below is the single framework boundary.
    return () => {
      const content = children.value;
      adoptRefOwner(content, instance);
      return (content as unknown as VNodeChild) ?? null;
    };
  },
});
