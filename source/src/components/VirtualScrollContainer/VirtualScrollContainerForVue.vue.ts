import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';
import type { PropType } from 'vue';

import { getScrollableClassName, Scrollable } from './getScrollableClassName';
import { VirtualScrollContainerCls } from './VirtualScrollContainer.css';
import { join } from '../../utils/join';

const rootClassName = 'InfiniteVirtualScrollContainer';

export type VirtualScrollContainerScrollPosition = {
  scrollTop: number;
  scrollLeft: number;
};

/**
 * Vue sibling of VirtualScrollContainer: same DOM structure and (shared,
 * vanilla-extract) classnames; scroll events are forwarded through
 * onContainerScroll and the scroller element is surfaced via scrollerRef.
 */
export const VirtualScrollContainer = defineComponent({
  name: 'VirtualScrollContainer',
  props: {
    scrollable: {
      type: [Boolean, String, Object] as PropType<Scrollable>,
      required: false,
      default: true,
    },
    tabIndex: { type: Number, required: false },
    autoFocus: { type: Boolean, required: false },
    onContainerScroll: {
      type: Function as PropType<
        (scrollPos: VirtualScrollContainerScrollPosition) => void
      >,
      required: false,
    },
    scrollerRef: {
      type: Function as PropType<(el: HTMLElement | null) => void>,
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    const domRef = ref<HTMLElement | null>(null);

    const onScroll = (event: Event) => {
      const node = event.target as HTMLElement;
      props.onContainerScroll?.({
        scrollTop: node.scrollTop,
        scrollLeft: node.scrollLeft,
      });
    };

    onMounted(() => {
      const node = domRef.value;
      if (!node) {
        return;
      }
      props.scrollerRef?.(node);
      node.addEventListener('scroll', onScroll, { passive: false });

      if (props.autoFocus && document.activeElement !== node) {
        node.focus();
      }
    });

    onBeforeUnmount(() => {
      domRef.value?.removeEventListener('scroll', onScroll);
      props.scrollerRef?.(null);
    });

    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: domRef,
          tabindex: props.tabIndex,
          class: join(
            attrs.class as string | undefined,
            rootClassName,
            VirtualScrollContainerCls,
            getScrollableClassName(props.scrollable),
          ),
        },
        slots.default?.(),
      );
  },
});
