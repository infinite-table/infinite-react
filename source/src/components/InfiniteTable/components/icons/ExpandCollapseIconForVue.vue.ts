import { defineComponent, h, ref, watch } from 'vue';
import type { PropType, CSSProperties } from 'vue';

import { join } from '../../../../utils/join';
import {
  ExpanderIconCls,
  ExpanderIconClsVariants,
} from './ExpandCollapseIcon.css';
import { InfiniteIconClassName } from './InfiniteIconClassName';

const THIS_ICON = `${InfiniteIconClassName}-expand-collapse`;

/**
 * Vue sibling of ExpandCollapseIcon - same DOM (svg + data attributes,
 * same classnames) so all css and Playwright selectors work unchanged.
 */
export const ExpandCollapseIcon = defineComponent({
  name: 'ExpandCollapseIcon',
  props: {
    size: { type: Number, default: 24 },
    expanded: { type: Boolean, default: undefined },
    defaultExpanded: { type: Boolean, default: undefined },
    onChange: {
      type: Function as PropType<(expanded: boolean) => void>,
      default: undefined,
    },
    style: {
      type: Object as PropType<CSSProperties>,
      default: undefined,
    },
    disabled: { type: Boolean, default: false },
    className: { type: String, default: undefined },
    direction: {
      type: String as PropType<'end' | 'start'>,
      default: 'start',
    },
  },
  setup(props) {
    const isControlled = () => props.expanded !== undefined;

    const expanded = ref(props.expanded ?? props.defaultExpanded ?? false);

    watch(
      () => props.expanded,
      (value) => {
        if (isControlled()) {
          expanded.value = !!value;
        }
      },
    );

    const onClick = () => {
      props.onChange?.(!expanded.value);
      if (!isControlled()) {
        expanded.value = !expanded.value;
      }
    };

    return () => {
      const currentState = expanded.value ? 'expanded' : 'collapsed';
      const { size, direction, disabled } = props;

      return h(
        'svg',
        {
          'data-name': 'expand-collapse-icon',
          'data-state': currentState,
          'data-disabled': disabled,
          xmlns: 'http://www.w3.org/2000/svg',
          height: `${size}px`,
          viewBox: '0 0 24 24',
          width: `${size}px`,
          style: props.style,
          onClick: disabled ? undefined : onClick,
          class: join(
            props.className,
            ExpanderIconCls,
            ExpanderIconClsVariants({
              direction: direction || 'start',
              expanded: expanded.value,
              disabled,
            }),
            `${InfiniteIconClassName}`,
            `${THIS_ICON}`,
            `${THIS_ICON}--${currentState}`,
            `${THIS_ICON}--${direction === 'end' ? 'end' : 'start'}`,
            disabled ? `${THIS_ICON}--disabled` : '',
          ),
        },
        [
          h('path', {
            d: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z',
          }),
        ],
      );
    };
  },
});
