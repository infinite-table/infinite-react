import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';
import type { PropType } from 'vue';

import { setupResizeObserver } from '../ResizeObserver/setupResizeObserver';

import type { ScrollPosition } from '../types/ScrollPosition';
import type { Size } from '../types/Size';

import { MatrixBrain } from '../VirtualBrain/MatrixBrain';
import { scrollTransformTargetCls } from '../VirtualList/VirtualList.css';
import { SpacePlaceholder } from '../VirtualList/SpacePlaceholderForVue.vue';
import { VirtualScrollContainerChildToScrollCls } from '../VirtualScrollContainer/VirtualScrollContainer.css';
import { VirtualScrollContainer } from '../VirtualScrollContainer/VirtualScrollContainerForVue.vue';
import { RawTable } from './RawTableForVue.vue';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { Renderable } from '../types/Renderable';
import { join } from '../../utils/join';
import { TableRenderCellFn, TableRenderDetailRowFn } from './rendererTypes';
import { GridRenderer } from './ReactHeadlessTableRenderer';
import { CELL_DETACHED_CLASSNAMES } from '../InfiniteTable/components/cellDetachedCls';
import { ActiveCellIndicator } from '../InfiniteTable/components/ActiveCellIndicatorForVue.vue';
import { ActiveRowIndicator } from '../InfiniteTable/components/ActiveRowIndicatorForVue.vue';

const CHILD_TO_SCROLL_CLS = join(
  scrollTransformTargetCls,
  VirtualScrollContainerChildToScrollCls,
);

/**
 * Vue sibling of HeadlessTable (HeadlessTable/index.tsx): the scrollable
 * virtualized grid shell — scroll container + transform target + RawTable +
 * ActiveCellIndicator/ActiveRowIndicator + scroll-size placeholder.
 */
export const HeadlessTable = defineComponent({
  name: 'HeadlessTable',
  props: {
    brain: { type: Object as PropType<MatrixBrain>, required: true },
    renderCell: {
      type: Function as PropType<TableRenderCellFn>,
      required: true,
    },
    renderDetailRow: {
      type: Function as PropType<TableRenderDetailRowFn>,
      required: false,
    },
    cellHoverClassNames: { type: Array as PropType<string[]>, required: false },
    renderer: { type: Object as PropType<GridRenderer>, required: false },
    onRenderUpdater: {
      type: Function as PropType<SubscriptionCallback<Renderable>>,
      required: false,
    },
    forceRerenderTimestamp: { type: Number, required: false },
    scrollStopDelay: { type: Number, required: false },
    wrapRowsHorizontally: { type: Boolean, required: false },
    autoFocus: { type: Boolean, required: false },
    tabIndex: { type: Number, required: false },
    activeRowIndex: {
      type: Number as PropType<number | null>,
      required: false,
      default: null,
    },
    activeCellIndex: {
      type: Array as unknown as PropType<[number, number] | null>,
      required: false,
      default: null,
    },
    activeCellRowHeight: {
      type: [Number, Function] as PropType<
        number | ((rowIndex: number) => number)
      >,
      required: false,
    },
    scrollerRef: {
      type: Function as PropType<(el: HTMLElement | null) => void>,
      required: false,
    },
  },
  setup(props, { attrs }) {
    const domRef = ref<HTMLElement | null>(null);

    const scrollSize = shallowRef<Size>({ width: 0, height: 0 });

    watch(
      () => props.scrollStopDelay,
      (scrollStopDelay) => {
        if (scrollStopDelay != null) {
          props.brain.setScrollStopDelay(scrollStopDelay);
        }
      },
      { immediate: true },
    );

    const updateDOMTransform = (scrollPos: ScrollPosition) => {
      requestAnimationFrame(() => {
        if (!domRef.value) {
          // we're in a raf, so the component might have been unmounted in
          // the meantime - protect against that
          return;
        }
        domRef.value.style.setProperty(
          'transform',
          `translate3d(${-scrollPos.scrollLeft}px, ${-scrollPos.scrollTop}px, 0px)`,
        );
      });
    };

    const onContainerScroll = (scrollPos: ScrollPosition) => {
      props.brain.setScrollPosition(scrollPos, updateDOMTransform);
    };

    let removeResizeObserver: VoidFunction | null = null;
    let removeOnRenderCount: VoidFunction | null = null;

    const wireBrain = (brain: MatrixBrain) => {
      removeOnRenderCount?.();

      removeOnRenderCount = brain.onRenderCountChange(() => {
        scrollSize.value = brain.getVirtualizedContentSize();
      });

      scrollSize.value = brain.getVirtualizedContentSize();

      // useful when the brain is changed - when toggling the value of
      // wrapRowsHorizontally
      updateDOMTransform(
        brain.getScrollPosition() || { scrollLeft: 0, scrollTop: 0 },
      );
    };

    const wireResizeObserver = () => {
      removeResizeObserver?.();
      removeResizeObserver = null;

      const node = domRef.value?.parentNode as HTMLElement;
      if (!node) {
        return;
      }

      const onResize = () => {
        // it's not enough to read the size from onResize
        // since that doesn't account for scrollbar presence and size
        // so we need to read it from the DOM from clientWidth/clientHeight
        const size: Size = {
          height: node.clientHeight,
          width: node.clientWidth,
        };

        props.brain.update(size);
      };
      removeResizeObserver = setupResizeObserver(node, onResize, {
        debounce: 50,
      });
    };

    onMounted(() => {
      wireBrain(props.brain);
      wireResizeObserver();
    });

    watch(
      () => props.brain,
      (brain) => {
        wireBrain(brain);
        wireResizeObserver();
      },
    );

    watch(
      () => props.wrapRowsHorizontally,
      () => {
        wireResizeObserver();
      },
    );

    onBeforeUnmount(() => {
      removeResizeObserver?.();
      removeOnRenderCount?.();
    });

    return () =>
      h(
        VirtualScrollContainer,
        {
          ...attrs,
          autoFocus: props.autoFocus,
          tabIndex: props.tabIndex,
          onContainerScroll,
          scrollerRef: props.scrollerRef,
        },
        {
          default: () => [
            h(
              'div',
              {
                ref: domRef,
                class: CHILD_TO_SCROLL_CLS,
                'data-name': 'scroll-transform-target',
              },
              [
                h(RawTable, {
                  forceRerenderTimestamp: props.forceRerenderTimestamp,
                  renderer: props.renderer,
                  onRenderUpdater: props.onRenderUpdater,
                  renderCell: props.renderCell,
                  renderDetailRow: props.renderDetailRow,
                  brain: props.brain,
                  cellHoverClassNames: props.cellHoverClassNames,
                  cellDetachedClassNames: CELL_DETACHED_CLASSNAMES,
                }),
                props.activeCellIndex != null
                  ? h(ActiveCellIndicator, {
                      brain: props.brain,
                      rowHeight: props.activeCellRowHeight,
                      activeCellIndex: props.activeCellIndex,
                    })
                  : null,
              ],
            ),
            props.activeRowIndex != null
              ? h(ActiveRowIndicator, {
                  brain: props.brain,
                  activeRowIndex: props.activeRowIndex,
                })
              : null,
            h(SpacePlaceholder, {
              width: scrollSize.value.width,
              height: scrollSize.value.height,
            }),
          ],
        },
      );
  },
});
