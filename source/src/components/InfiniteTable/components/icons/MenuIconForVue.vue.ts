/**
 * Vue sibling of MenuIcon.tsx — the 3-lines burger icon in header cells
 * that opens the column menu. Same DOM, classnames and data attributes.
 */
import { defineComponent, h } from 'vue';
import type { PropType, VNodeChild } from 'vue';

import { join } from '../../../../utils/join';
import { ThemeVars } from '../../vars.css';

import { HeaderMenuIconCls } from '../InfiniteTableHeader/header.css';
import { InfiniteIconClassName } from './InfiniteIconClassName';
import { MenuIconDataAttributesValues } from './menuIconAttributes';

export type MenuIconVueProps = {
  lineWidth?: number;
  lineStyle?: Record<string, any>;
  style?: Record<string, any>;
  className?: string;
  domProps?: Record<string, any>;
  reserveSpaceWhenHidden?: boolean;
  menuVisible?: boolean;
};

const defaultLineStyle: Record<string, any> = {
  width: '100%',
  pointerEvents: 'none',
};

const lineClassName = `${InfiniteIconClassName}-menu`;

export const MenuIcon = defineComponent({
  name: 'MenuIcon',
  props: {
    lineWidth: { type: Number, required: false },
    lineStyle: {
      type: Object as PropType<Record<string, any>>,
      required: false,
    },
    style: { type: Object as PropType<Record<string, any>>, required: false },
    className: { type: String, required: false },
    domProps: {
      type: Object as PropType<Record<string, any>>,
      required: false,
    },
    reserveSpaceWhenHidden: { type: Boolean, required: false },
    menuVisible: { type: Boolean, required: false },
  },
  setup(props, { slots }) {
    return () => {
      const lineStyle = {
        ...defaultLineStyle,
        borderTop: `${ThemeVars.components.HeaderCell.menuIconLineWidth} solid currentColor`,
        ...props.lineStyle,
      };

      const children: VNodeChild = slots.default
        ? slots.default()
        : [
            h('div', { class: lineClassName, style: lineStyle }),
            h('div', { class: lineClassName, style: lineStyle }),
            h('div', { class: lineClassName, style: lineStyle }),
          ];

      return h(
        'div',
        {
          ...props.domProps,
          style: props.style,
          ...MenuIconDataAttributesValues,
          onPointerdown: (e: PointerEvent) => {
            e.stopPropagation();
            props.domProps?.onPointerdown?.(e);
          },
          class: join(
            props.className,
            HeaderMenuIconCls({
              menuVisible: props.menuVisible,
              reserveSpaceWhenHidden: props.reserveSpaceWhenHidden,
            }),
            InfiniteIconClassName,
            `${InfiniteIconClassName}-menu`,
          ),
        },
        children,
      );
    };
  },
});
