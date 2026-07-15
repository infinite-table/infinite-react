import { defineComponent, h } from 'vue';
import type { CSSProperties } from 'vue';

import { join } from '../../../../../utils/join';
import { LoadingIconCls } from './loading.css';
import {
  loadingIconPropNames,
  loadingIconStrokeDasharray,
  loadingIconSvgStyle,
} from './shared';
import type { LoadingIconProps } from './shared';

/**
 * Vue sibling of LoadingIcon - same DOM (svg spinner, same classnames).
 */
export const LoadingIcon = defineComponent(
  (props: LoadingIconProps<CSSProperties>) => {
    return () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          style: {
            ...(loadingIconSvgStyle as CSSProperties),
            ...props.style,
          },
          width: '24px',
          height: '24px',
          viewBox: props.viewBox ?? '0 0 100 100',
          preserveAspectRatio: 'xMidYMid',
          class: join(
            props.className,
            LoadingIconCls,
            'InfiniteIcon',
            'InfiniteIcon-loading',
          ),
        },
        [
          h(
            'circle',
            {
              cx: '50',
              cy: '50',
              fill: 'none',
              'stroke-width': '10',
              r: '35',
              'stroke-dasharray': loadingIconStrokeDasharray,
            },
            [
              h('animateTransform', {
                attributeName: 'transform',
                type: 'rotate',
                repeatCount: 'indefinite',
                dur: '1s',
                values: '0 50 50;360 50 50',
                keyTimes: '0;1',
              }),
            ],
          ),
        ],
      );
  },
  {
    name: 'LoadingIcon',
    props: [...loadingIconPropNames],
  },
);
