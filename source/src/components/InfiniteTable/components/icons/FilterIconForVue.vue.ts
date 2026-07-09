import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';
import type { CSSProperties, PropType } from 'vue';

import { join } from '../../../../utils/join';
import { HeaderFilterIconIndexCls } from '../InfiniteTableHeader/header.css';
import { InfiniteIconClassName } from './InfiniteIconClassName';
import { FilterIconCls } from './FilterIcon.css';

const defaultLineStyle: CSSProperties = {
  transition: `width 0.25s, opacity 0.25s`,
};

/**
 * Vue sibling of FilterIcon - same DOM (data-name="filter-icon", three lines
 * with decreasing widths) and the same fade-in behavior.
 */
export const FilterIcon = defineComponent({
  name: 'FilterIcon',
  props: {
    size: { type: Number, default: undefined },
    lineWidth: { type: Number, default: 1 },
    lineStyle: { type: Object as PropType<CSSProperties>, default: undefined },
    style: { type: Object as PropType<CSSProperties>, default: undefined },
    className: { type: String, default: undefined },
    index: { type: Number, default: undefined },
  },
  setup(props) {
    const opacity = ref(0);
    let rafId: number | null = null;

    onMounted(() => {
      rafId = requestAnimationFrame(() => {
        rafId = null;
        opacity.value = 1;
      });
    });

    onBeforeUnmount(() => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
    });

    return () => {
      const { lineWidth, className, index } = props;

      const showIndex = index != null && index > 0;

      const size = props.size ?? 16;
      const part = Math.floor(size / 4);
      const sizes = [size - 1 * part, size - 2 * part, size - 3 * part];

      const lineStyle: CSSProperties = {
        ...defaultLineStyle,
        borderTop: `${lineWidth}px solid currentColor`,
        ...props.lineStyle,
        opacity: opacity.value,
      };

      return h(
        'div',
        {
          'data-name': 'filter-icon',
          style: { ...props.style, width: `${size}px` },
          class: join(
            className,
            InfiniteIconClassName,
            FilterIconCls,
            `${InfiniteIconClassName}-filter`,
          ),
        },
        [
          showIndex
            ? h(
                'div',
                { 'data-name': 'index', class: HeaderFilterIconIndexCls },
                `${index}`,
              )
            : null,
          h('div', { style: { width: `${sizes[0]}px`, ...lineStyle } }),
          h('div', { style: { width: `${sizes[1]}px`, ...lineStyle } }),
          h('div', { style: { width: `${sizes[2]}px`, ...lineStyle } }),
        ],
      );
    };
  },
});
