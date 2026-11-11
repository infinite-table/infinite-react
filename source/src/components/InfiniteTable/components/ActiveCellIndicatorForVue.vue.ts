import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import type { PropType } from 'vue';

import { stripVar } from '../../../utils/stripVar';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';

import { internalProps } from '../internalProps';
import { InternalVars } from '../internalVars.css';
import { setInfiniteVarsOnNode } from '../utils/infiniteDOMUtils';
import { getActiveCellIndicatorVars } from './activeIndicatorOffsets';
import {
  ActiveCellIndicatorRecipe,
  ActiveIndicatorWrapperCls,
} from './ActiveCellIndicator.css';

const { rootClassName } = internalProps;

const baseCls = `${rootClassName}-ActiveCellIndicator`;

const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

type ActiveCellIndexType = [number, number];
type RowHeightType = number | ((rowIndex: number) => number);

/**
 * Vue sibling of ActiveCellIndicator (components/ActiveCellIndicator.tsx):
 * same DOM structure, classnames and CSS-var positioning.
 */
export const ActiveCellIndicator = defineComponent({
  name: 'ActiveCellIndicator',
  props: {
    activeCellIndex: {
      type: Array as unknown as PropType<ActiveCellIndexType | null>,
      required: false,
      default: null,
    },
    brain: { type: Object as PropType<MatrixBrain>, required: true },
    rowHeight: {
      type: [Number, Function] as PropType<RowHeightType>,
      required: false,
    },
  },
  setup(props) {
    const domRef = ref<HTMLElement | null>(null);
    // bumped when the brain rerenders, so `active` (which reads
    // brain.getInitialRows()) is recomputed - the React version calls
    // rerender() on brain.onRenderCountChange
    const renderCount = ref(0);

    const reposition = () => {
      const { activeCellIndex, brain, rowHeight } = props;
      if (activeCellIndex == null) {
        return;
      }

      setInfiniteVarsOnNode(
        getActiveCellIndicatorVars(brain, activeCellIndex, rowHeight),
        domRef.value,
      );
    };

    let removeOnRenderCountChange: VoidFunction | null = null;
    let removeOnScrollOriginChange: VoidFunction | null = null;
    const wireBrain = (brain: MatrixBrain) => {
      removeOnRenderCountChange?.();
      removeOnScrollOriginChange?.();
      removeOnRenderCountChange = brain.onRenderCountChange(() => {
        renderCount.value++;
      });
      // offsets are relative to the scroll origin - see largeContent.ts
      removeOnScrollOriginChange = brain.onScrollOriginChange(reposition);
    };

    onMounted(() => {
      wireBrain(props.brain);
      reposition();
    });

    watch(() => props.brain, wireBrain);

    watch(
      [() => props.activeCellIndex, () => props.rowHeight, () => props.brain],
      () => reposition(),
      { flush: 'post' },
    );

    onBeforeUnmount(() => {
      removeOnRenderCountChange?.();
      removeOnScrollOriginChange?.();
    });

    return () => {
      // establish the dependency on brain render count
      void renderCount.value;

      const active =
        props.activeCellIndex != null &&
        props.brain.getInitialRows() > props.activeCellIndex[0];

      // #correct-scroll-size this wrapper is here in order to make the
      // indicator not take up space in the scroll container
      return h(
        'div',
        {
          class: ActiveIndicatorWrapperCls,
          ref: domRef,
          'data-name': 'active-cell',
          style: active
            ? {
                zIndex: `var(${columnZIndexAtIndex}-${
                  props.activeCellIndex![1]
                })`,
              }
            : undefined,
        },
        [
          h('div', {
            'data-name': 'active-cell-indicator',
            class: `${baseCls} ${ActiveCellIndicatorRecipe({
              visible: active,
            })}`,
          }),
        ],
      );
    };
  },
});
