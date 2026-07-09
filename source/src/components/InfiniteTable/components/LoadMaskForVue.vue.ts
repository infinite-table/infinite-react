import { defineComponent, h } from 'vue';

import {
  LoadMaskCls,
  LoadMaskOverlayCls,
  LoadMaskTextCls,
} from './LoadMask.css';
import { internalProps } from '../internalProps';

const { rootClassName } = internalProps;
const baseCls = `${rootClassName}-LoadMask`;

/**
 * Vue sibling of LoadMask (components/LoadMask.tsx): same DOM structure and
 * classnames.
 */
export const LoadMask = defineComponent({
  name: 'LoadMask',
  props: {
    visible: { type: Boolean, required: true },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          class: `${
            LoadMaskCls[props.visible ? 'visible' : 'hidden']
          } ${baseCls}`,
        },
        [
          h('div', { class: `${LoadMaskOverlayCls} ${baseCls}-Overlay` }),
          h(
            'div',
            { class: `${LoadMaskTextCls} ${baseCls}-Text` },
            slots.default ? slots.default() : 'Loading',
          ),
        ],
      );
  },
});
