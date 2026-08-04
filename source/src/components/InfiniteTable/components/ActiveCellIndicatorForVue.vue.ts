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

      let [rowIndex] = activeCellIndex;

      if (brain.isHorizontalLayoutBrain && brain.rowsPerPage) {
        rowIndex = rowIndex % brain.rowsPerPage;
      }

      const activeCellRowHeight: number =
        typeof rowHeight === 'function'
          ? rowHeight(rowIndex)
          : rowHeight ?? brain.getRowHeight(rowIndex);
      const activeCellRowOffset = brain.getItemOffsetFor(rowIndex, 'vertical');

      setInfiniteVarsOnNode(
        {
          activeCellRowHeight: `${activeCellRowHeight}px`,
          activeCellRowOffset: `${activeCellRowOffset}px`,
        },
        domRef.value,
      );
    };

    let removeOnRenderCountChange: VoidFunction | null = null;
    const wireBrain = (brain: MatrixBrain) => {
      removeOnRenderCountChange?.();
      removeOnRenderCountChange = brain.onRenderCountChange(() => {
        renderCount.value++;
      });
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
