import { Comment, defineComponent, h } from 'vue';
import type { VNode } from 'vue';

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
    return () => {
      // the grid always passes `loadingText` as the slot: a slot that renders
      // nothing (loadingText not set) gets the default text, like React's
      // `children = 'Loading'`
      const content = slots.default?.() as VNode[] | undefined;
      const empty =
        !content ||
        content.every((vnode) => vnode == null || vnode.type === Comment);

      return h(
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
            empty ? 'Loading' : content,
          ),
        ],
      );
    };
  },
});
