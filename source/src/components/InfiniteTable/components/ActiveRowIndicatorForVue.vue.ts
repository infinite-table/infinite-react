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
import { ScrollPosition } from '../../types/ScrollPosition';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';

import { internalProps } from '../internalProps';
import { InternalVars } from '../internalVars.css';
import { setInfiniteVarsOnNode } from '../utils/infiniteDOMUtils';
import { ThemeVars } from '../vars.css';
import { ActiveIndicatorWrapperCls } from './ActiveCellIndicator.css';
import { ActiveRowIndicatorRecipe } from './ActiveRowIndicator.css';

const { rootClassName } = internalProps;
const baseCls = `${rootClassName}-ActiveRowIndicator`;

const transformX = `calc(${InternalVars.activeCellRowOffsetX} + var(${stripVar(
  InternalVars.scrollLeftForActiveRowWhenHorizontalLayout,
)}, 0px))`;

const ActiveStyle: Record<string, string> = {
  [stripVar(InternalVars.activeCellOffsetY)]: InternalVars.activeCellRowOffset,

  transform: `translate3d(${transformX}, calc( ${
    InternalVars.activeCellOffsetY
  } + var(${stripVar(InternalVars.scrollTopForActiveRow)}, 0px)), 0px)`,
  height: InternalVars.activeCellRowHeight,
  maxWidth: ThemeVars.runtime.totalVisibleColumnsWidthVar,
};

/**
 * Vue sibling of ActiveRowIndicator (components/ActiveRowIndicator.tsx):
 * same DOM structure, classnames and CSS-var positioning, including the
 * scroll-synced transform vars.
 */
export const ActiveRowIndicator = defineComponent({
  name: 'ActiveRowIndicator',
  props: {
    activeRowIndex: {
      type: Number as PropType<number | null>,
      required: false,
      default: null,
    },
    brain: { type: Object as PropType<MatrixBrain>, required: true },
  },
  setup(props) {
    const domRef = ref<HTMLElement | null>(null);
    const renderCount = ref(0);

    const reposition = () => {
      const { brain } = props;
      if (props.activeRowIndex == null) {
        return;
      }

      let activeCellRowOffsetX = '0px';
      let rowIndex = props.activeRowIndex;

      if (brain.isHorizontalLayoutBrain && brain.rowsPerPage) {
        const pageIndex = brain.getPageIndexForRow(rowIndex);
        if (pageIndex > 0) {
          activeCellRowOffsetX = `calc(${ThemeVars.runtime.totalVisibleColumnsWidthVar} * ${pageIndex})`;
        }
        rowIndex = rowIndex % brain.rowsPerPage;
      }
      const activeCellRowHeight = brain.getRowHeight(rowIndex);
      const activeCellRowOffset = brain.getItemOffsetFor(rowIndex, 'vertical');

      setInfiniteVarsOnNode(
        {
          activeCellRowHeight: `${activeCellRowHeight}px`,
          activeCellRowOffset: `${activeCellRowOffset}px`,
          activeCellRowOffsetX,
        },
        domRef.value,
      );
    };

    const updateScrollVars = (scrollPosition: ScrollPosition) => {
      setInfiniteVarsOnNode(
        {
          scrollTopForActiveRow: `${-scrollPosition.scrollTop}px`,
          scrollLeftForActiveRowWhenHorizontalLayout: props.brain
            .isHorizontalLayoutBrain
            ? `${-scrollPosition.scrollLeft}px`
            : '0px',
        },
        domRef.value,
      );
    };

    let removeOnScroll: VoidFunction | null = null;
    let removeOnRenderCountChange: VoidFunction | null = null;

    const wireBrain = (brain: MatrixBrain) => {
      removeOnScroll?.();
      removeOnRenderCountChange?.();

      updateScrollVars(brain.getScrollPosition());
      removeOnScroll = brain.onScroll(updateScrollVars);
      removeOnRenderCountChange = brain.onRenderCountChange(() => {
        renderCount.value++;
      });
    };

    onMounted(() => {
      wireBrain(props.brain);
      reposition();
    });

    watch(() => props.brain, wireBrain);

    watch([() => props.activeRowIndex, () => props.brain], () => reposition(), {
      flush: 'post',
    });

    onBeforeUnmount(() => {
      removeOnScroll?.();
      removeOnRenderCountChange?.();
    });

    return () => {
      void renderCount.value;

      const active =
        props.activeRowIndex != null &&
        props.brain.getInitialRows() > props.activeRowIndex;

      // #correct-scroll-size this wrapper is here in order to make the
      // indicator not take up space in the scroll container
      return h(
        'div',
        { class: ActiveIndicatorWrapperCls, 'data-name': 'active-row' },
        [
          h('div', {
            ref: domRef,
            'data-name': 'active-row-indicator',
            class: `${baseCls} ${ActiveRowIndicatorRecipe({
              active,
            })}`,
            style: active ? ActiveStyle : undefined,
          }),
        ],
      );
    };
  },
});
