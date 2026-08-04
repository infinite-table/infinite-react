import { defineComponent, h } from 'vue';

import { useInfiniteColumnFilterEditor } from './InfiniteTableHeader/InfiniteTableColumnHeaderFilterForVue.vue';

/**
 * Vue siblings of the default filter editors (FilterEditors.tsx).
 */
export const StringFilterEditor = defineComponent({
  name: 'StringFilterEditor',
  setup() {
    const editor = useInfiniteColumnFilterEditor();

    return () =>
      h('input', {
        'aria-label': editor.ariaLabel.value,
        type: 'text',
        disabled: editor.disabled.value,
        value: (editor.value.value as string) ?? '',
        onInput: (event: Event) => {
          editor.setValue((event.target as HTMLInputElement).value);
        },
        class: editor.className,
      });
  },
});

export const NumberFilterEditor = defineComponent({
  name: 'NumberFilterEditor',
  setup() {
    const editor = useInfiniteColumnFilterEditor();

    return () =>
      h('input', {
        'aria-label': editor.ariaLabel.value,
        type: 'number',
        disabled: editor.disabled.value,
        value: (editor.value.value as number) ?? '',
        onInput: (event: Event) => {
          const target = event.target as HTMLInputElement;
          const value = isNaN(target.valueAsNumber)
            ? target.value
            : target.valueAsNumber;
          editor.setValue(value);
        },
        class: editor.className,
      });
  },
});
