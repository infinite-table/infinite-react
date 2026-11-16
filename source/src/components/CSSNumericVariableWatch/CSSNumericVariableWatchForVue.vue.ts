/**
 * Vue sibling of CSSNumericVariableWatch.tsx - renders a hidden element
 * whose height is driven by a CSS variable, and reports (numeric) changes
 * of that variable via a ResizeObserver.
 */
import { defineComponent, h, onBeforeUnmount, onMounted } from 'vue';
import type { CSSProperties, PropType } from 'vue';

import { setupResizeObserver } from '../ResizeObserver/setupResizeObserver';
import { error, debug, toWatchedCSSValue, WRAPPER_STYLE } from './shared';

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
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

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
        if (height == null || timeoutId != null) {
          return;
        }
        // not from inside the observer callback: onChange changes the
        // grid's state, Vue re-renders in a microtask - still inside the
        // browser's resize observation loop - and the new row heights then
        // resize observed elements again ("ResizeObserver loop completed
        // with undelivered notifications"). React re-renders in a later task,
        // and so does this.
        timeoutId = setTimeout(() => {
          timeoutId = null;
          const value = node.getBoundingClientRect().height;
          if (value !== lastValue) {
            lastValue = value;
            props.onChange(value);
          }
        }, 0);
      });
    });

    onBeforeUnmount(() => {
      teardown?.();
      teardown = null;
      if (timeoutId != null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    });

    return () => {
      const height = toWatchedCSSValue(props.varName);

      return h(
        'div',
        {
          'data-name': 'css-variable-watcher',
          'data-var': props.varName,
          style: WRAPPER_STYLE as CSSProperties,
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
