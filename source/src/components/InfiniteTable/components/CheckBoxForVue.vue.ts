import { defineComponent, h, onMounted, ref, watch } from 'vue';
import type { PropType } from 'vue';

import { join } from '../../../utils/join';
import { CheckBoxCls } from './CheckBox.css';
import type { InfiniteCheckBoxPropChecked } from './CheckBox';

/**
 * Vue sibling of InfiniteCheckBox. Renders the same
 * input.InfiniteCheckBox and supports the controlled/uncontrolled
 * `checked` contract (null = indeterminate), matching the React
 * managed-component behavior.
 */
export const InfiniteCheckBox = defineComponent({
  name: 'InfiniteCheckBox',
  props: {
    disabled: { type: Boolean, default: false },
    checked: {
      type: [Boolean, Object] as PropType<InfiniteCheckBoxPropChecked>,
      default: undefined,
    },
    defaultChecked: {
      type: [Boolean, Object] as PropType<InfiniteCheckBoxPropChecked>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<
        (checked: InfiniteCheckBoxPropChecked) => void
      >,
      default: undefined,
    },
    domProps: {
      type: Object as PropType<Record<string, any>>,
      default: undefined,
    },
  },
  setup(props) {
    const isControlled = () => props.checked !== undefined;

    // null is a valid value (indeterminate), so only undefined falls back
    const initialChecked = isControlled()
      ? props.checked
      : props.defaultChecked;
    const checked = ref<InfiniteCheckBoxPropChecked>(
      initialChecked === undefined ? false : initialChecked,
    );
    const inputRef = ref<HTMLInputElement | null>(null);

    const syncIndeterminate = () => {
      if (inputRef.value) {
        inputRef.value.indeterminate = checked.value == null;
      }
    };

    onMounted(syncIndeterminate);

    watch(
      () => props.checked,
      (value) => {
        if (isControlled()) {
          checked.value = value === undefined ? false : value;
          syncIndeterminate();
        }
      },
    );

    const onChange = () => {
      if (props.disabled) {
        return;
      }
      const newChecked = !checked.value;
      if (!isControlled()) {
        checked.value = newChecked;
        syncIndeterminate();
      }
      props.onChange?.(newChecked);
    };

    return () => {
      const domProps = props.domProps || {};
      return h('input', {
        ...domProps,
        class: join('InfiniteCheckBox', CheckBoxCls, domProps.class),
        type: 'checkbox',
        ref: inputRef,
        checked: !!checked.value,
        disabled: props.disabled,
        onChange,
      });
    };
  },
});
