import { defineComponent, h, ref, watch, onBeforeUnmount } from 'vue';
import type { CSSProperties } from 'vue';

import { join } from '../../../../../utils/join';
import { HeaderSortIconIndexCls } from '../../InfiniteTableHeader/header.css';
import { InfiniteIconClassName } from '../InfiniteIconClassName';
import { SortIconCls } from './SortIcon.css';
import { defaultLineStyle, sortIconPropNames } from './shared';
import type { SortIconProps } from './shared';

/**
 * Vue sibling of SortIcon - same DOM (data-name="sort-icon", three lines with
 * animated widths + optional sort index) and the same fade in/out behavior.
 * Functional defineComponent signature so the props type is the same
 * SortIconProps the React sibling uses (runtime prop names come from
 * sortIconPropNames, kept in sync with the type via `satisfies`).
 */
export const SortIcon = defineComponent(
  (props: SortIconProps<CSSProperties>) => {
    const rendered = ref(true);
    const opacity = ref(0);

    let rafId: number | null = null;

    watch(
      () => props.direction,
      (direction) => {
        const newOpacity = direction != 0 ? 1 : 0;

        if (!rendered.value && newOpacity) {
          rendered.value = true;
        }
        if (newOpacity !== opacity.value) {
          if (rafId != null) {
            cancelAnimationFrame(rafId);
          }
          rafId = requestAnimationFrame(() => {
            rafId = null;
            opacity.value = newOpacity;
          });
        }
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
    });

    const onTransitionEnd = () => {
      const hidden = opacity.value === 0 && props.direction === 0;
      const newRendered = !hidden;
      if (newRendered !== rendered.value) {
        rendered.value = newRendered;
      }
    };

    return () => {
      // lineWidth default lived in the runtime props object before; now the
      // props are declared via the shared type, so it's defaulted here
      const { direction, lineWidth = 1, className, index } = props;

      if (!rendered.value && !props.forceSize) {
        return null;
      }

      const showIndex = index != null && index > 0;

      const size = props.size ?? 16;
      const part = Math.floor(size / 4);

      const sizes = direction
        ? [size - 3 * part, size - 2 * part, size - part]
        : [0, 0, 0];

      if (direction === -1) {
        sizes.reverse();
      }

      const lineStyle = {
        ...(defaultLineStyle as CSSProperties),
        borderTop: `${lineWidth}px solid currentColor`,
        ...props.lineStyle,
        opacity: opacity.value,
      };

      const indexStyle: CSSProperties = {};
      if (direction === -1) {
        indexStyle.top = '100%';
      }

      return h(
        'div',
        {
          'data-name': 'sort-icon',
          style: { ...props.style, width: `${size}px` },
          class: join(
            className,
            InfiniteIconClassName,
            SortIconCls,
            `${InfiniteIconClassName}-sort`,
          ),
        },
        [
          showIndex
            ? h(
                'div',
                {
                  'data-name': 'index',
                  style: indexStyle,
                  class: HeaderSortIconIndexCls,
                },
                `${index}`,
              )
            : null,
          h('div', {
            style: { width: `${sizes[0]}px`, ...lineStyle },
            onTransitionend: onTransitionEnd,
          }),
          h('div', { style: { width: `${sizes[1]}px`, ...lineStyle } }),
          h('div', { style: { width: `${sizes[2]}px`, ...lineStyle } }),
        ],
      );
    };
  },
  {
    name: 'SortIcon',
    props: [...sortIconPropNames],
  },
);
