import { defineComponent, h, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';

import { join } from '../../../../../utils/join';
import { InfiniteIconClassName } from '../InfiniteIconClassName';
import {
  ExpanderIconCls,
  ExpanderIconClsVariants,
} from './ExpandCollapseIcon.css';
import { expandCollapseIconPath, expandCollapseIconPropNames } from './shared';
import type { ExpandCollapseIconProps } from './shared';

const THIS_ICON = `${InfiniteIconClassName}-expand-collapse`;

/**
 * Vue sibling of ExpandCollapseIcon - same DOM (svg + data attributes,
 * same classnames) so all css and Playwright selectors work unchanged.
 */
export const ExpandCollapseIcon = defineComponent(
  (props: ExpandCollapseIconProps<CSSProperties>) => {
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
      const { size = 24, direction = 'start', disabled = false } = props;

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
            d: expandCollapseIconPath,
          }),
        ],
      );
    };
  },
  {
    name: 'ExpandCollapseIcon',
    props: [...expandCollapseIconPropNames],
  },
);
