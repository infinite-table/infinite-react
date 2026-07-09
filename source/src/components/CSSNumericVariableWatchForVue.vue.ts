/**
 * Vue sibling of CSSNumericVariableWatch.tsx - renders a hidden element
 * whose height is driven by a CSS variable, and reports (numeric) changes
 * of that variable via a ResizeObserver.
 */
import { defineComponent, h, onBeforeUnmount, onMounted } from 'vue';
import type { CSSProperties, PropType } from 'vue';

import { dbg, err } from '../utils/debugLoggers';
import { setupResizeObserver } from './ResizeObserver/setupResizeObserver';

const error = err('CSSVariableWatch');
const debug = dbg('CSSVariableWatch');

const WRAPPER_STYLE: CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  width: '0px',
  height: '0px',
  lineHeight: 0,
  fontSize: 0,
  overflow: 'hidden',
};

export const CSSNumericVariableWatch = defineComponent({
  name: 'CSSNumericVariableWatch',
  props: {
    varName: { type: String, required: true },
    allowInts: { type: Boolean, default: false },
    onChange: {
      type: Function as PropType<(value: number) => void>,
      required: true,
    },
  },
  setup(props) {
    const domRef: { current: HTMLElement | null } = { current: null };
    let lastValue = 0;
    let teardown: VoidFunction | null = null;

    onMounted(() => {
      const node = domRef.current;
      if (!node) {
        return;
      }

      const value = node.getBoundingClientRect().height;
      if (value != null) {
        lastValue = value;
        debug(`Variable ${props.varName} found and equals ${value}.`);
        props.onChange(value);
      } else {
        error(
          `Specified variable ${props.varName} not found or does not have a numeric value.`,
        );
      }

      teardown = setupResizeObserver(node, ({ height }) => {
        if (height != null && height !== lastValue) {
          lastValue = height;
          props.onChange(height);
        }
      });
    });

    onBeforeUnmount(() => {
      teardown?.();
      teardown = null;
    });

    return () => {
      const height = props.varName.startsWith('var(')
        ? props.varName
        : `var(${props.varName})`;

      return h(
        'div',
        {
          'data-name': 'css-variable-watcher',
          'data-var': props.varName,
          style: WRAPPER_STYLE,
        },
        [
          h('div', {
            ref: (el: any) => {
              domRef.current = (el as HTMLElement) ?? null;
            },
            style: {
              // we do multiplication in order to support integer
              // (without px) values as well
              height: props.allowInts ? `calc(1px * ${height})` : height,
            },
          }),
        ],
      );
    };
  },
});
