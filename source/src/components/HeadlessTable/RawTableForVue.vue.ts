import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  watch,
  watchEffect,
  PropType,
} from 'vue';

import { RenderSlot } from '../RawList/RenderSlot.vue';
import { Renderable } from '../types/Renderable';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { MatrixBrain } from '../VirtualBrain/MatrixBrain';
import { createRenderer } from './createRenderer.vue';

import { GridRenderer } from './ReactHeadlessTableRenderer';

import { TableRenderCellFn, TableRenderDetailRowFn } from './rendererTypes';

/**
 * Vue sibling of RawTable.tsx: wires the MatrixBrain render range to the
 * shared GridRenderer and renders the root RenderSlot the renderer pushes
 * cell nodes into.
 *
 * IMPORTANT: the brain, renderer and updater props are non-reactive
 * imperative objects — they must be passed raw (never through reactive()),
 * matching the reference-equality contract of the shared core.
 */
export const RawTable = defineComponent({
  name: 'RawTable',
  props: {
    name: { type: String, required: false },
    brain: { type: Object as PropType<MatrixBrain>, required: true },
    renderCell: {
      type: Function as PropType<TableRenderCellFn>,
      required: true,
    },
    renderDetailRow: {
      type: Function as PropType<TableRenderDetailRowFn>,
      required: false,
    },
    cellHoverClassNames: {
      type: Array as PropType<string[]>,
      required: false,
    },
    cellDetachedClassNames: {
      type: Array as PropType<string[]>,
      required: false,
      default: () => [],
    },
    renderer: { type: Object as PropType<GridRenderer>, required: false },
    onRenderUpdater: {
      type: Function as PropType<SubscriptionCallback<Renderable>>,
      required: false,
    },
    forceRerenderTimestamp: { type: Number, required: false },
  },
  setup(props) {
    // mirrors the React useMemo([brain, props.onRenderUpdater, props.renderer])
    const rendererAndUpdater = computed(() => {
      return props.onRenderUpdater && props.renderer
        ? {
            renderer: props.renderer,
            onRenderUpdater: props.onRenderUpdater,
          }
        : createRenderer(props.brain);
    });

    watchEffect(() => {
      rendererAndUpdater.value.renderer.cellHoverClassNames =
        props.cellHoverClassNames || [];
    });

    watchEffect(() => {
      rendererAndUpdater.value.renderer.cellDetachedClassNames =
        props.cellDetachedClassNames || [];
    });

    let removeOnRenderRangeChange: VoidFunction | null = null;

    const wireRenderRange = () => {
      removeOnRenderRangeChange?.();

      const { renderer, onRenderUpdater } = rendererAndUpdater.value;
      const { brain, renderCell, renderDetailRow } = props;

      const renderRange = brain.getRenderRange();

      renderer.renderRange(renderRange, {
        onRender: onRenderUpdater,
        force: true,
        renderCell,
        renderDetailRow,
      });

      removeOnRenderRangeChange = brain.onRenderRangeChange((renderRange) => {
        renderer.renderRange(renderRange, {
          force: false,
          onRender: (items) => {
            const currentItems = onRenderUpdater.get();
            if (
              currentItems &&
              items &&
              (currentItems as any).length === items.length
            ) {
              // dont update, as each item in turn
              // is a RenderSlot component
              // which is updating itself
              return;
            }
            onRenderUpdater(items);
          },
          renderCell,
          renderDetailRow,
        });
      });
    };

    // like the React useLayoutEffect: initial wiring after mount, re-wiring
    // whenever one of the dependencies changes
    onMounted(wireRenderRange);

    watch(
      () =>
        [
          rendererAndUpdater.value,
          props.brain,
          props.renderCell,
          props.renderDetailRow,
          props.forceRerenderTimestamp,
        ] as const,
      wireRenderRange,
      { flush: 'post' },
    );

    onBeforeUnmount(() => {
      removeOnRenderRangeChange?.();
      removeOnRenderRangeChange = null;
    });

    return () =>
      h(RenderSlot, {
        name: props.name,
        updater: rendererAndUpdater.value.onRenderUpdater,
      });
  },
});
