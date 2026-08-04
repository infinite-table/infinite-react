import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';
import type { CSSProperties } from 'vue';

import { join } from '../../../../../utils/join';
import { HeaderFilterIconIndexCls } from '../../InfiniteTableHeader/header.css';
import { InfiniteIconClassName } from '../InfiniteIconClassName';
import { FilterIconCls } from './FilterIcon.css';
import { defaultLineStyle, filterIconPropNames } from './shared';
import type { FilterIconProps } from './shared';

/**
 * Vue sibling of FilterIcon - same DOM (data-name="filter-icon", three lines
 * with decreasing widths) and the same fade-in behavior.
 */
export const FilterIcon = defineComponent(
  (props: FilterIconProps<CSSProperties>) => {
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
      const { lineWidth = 1, className, index } = props;

      const showIndex = index != null && index > 0;

      const size = props.size ?? 16;
      const part = Math.floor(size / 4);
      const sizes = [size - 1 * part, size - 2 * part, size - 3 * part];

      const lineStyle: CSSProperties = {
        ...(defaultLineStyle as CSSProperties),
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
  {
    name: 'FilterIcon',
    props: [...filterIconPropNames],
  },
);
