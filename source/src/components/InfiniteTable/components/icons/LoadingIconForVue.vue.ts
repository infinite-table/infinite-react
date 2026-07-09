import { defineComponent, h } from 'vue';

import { join } from '../../../../utils/join';
import { LoadingIconCls } from './LoadingIcon.css';

/**
 * Vue sibling of LoadingIcon - same DOM (svg spinner, same classnames).
 */
export const LoadingIcon = defineComponent({
  name: 'LoadingIcon',
  props: {
    size: { type: Number, default: 24 },
    className: { type: String, default: undefined },
  },
  setup(props) {
    return () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          style: {
            margin: 'auto',
            display: 'block',
            shapeRendering: 'auto',
          },
          width: '24px',
          height: '24px',
          viewBox: '0 0 100 100',
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
              'stroke-dasharray': '164.93361431346415 56.97787143782138',
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
});
