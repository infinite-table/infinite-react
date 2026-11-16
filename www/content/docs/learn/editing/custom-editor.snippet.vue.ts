// Snippets shown on the Vue version of custom-editor.page.md: the sibling of
// custom-editor.snippet.tsx, with the same `#region` names (the `intro` region
// is the same code for React and Vue, so the page shows it from the .tsx file).
// Type-checked with vue-tsc against the library source (`npm run tsc:vue`).

//#region customeditor-tsx
import { defineComponent, h, onMounted, ref } from 'vue';
import { useInfiniteColumnEditor } from '@infinite-table/infinite-vue';

const CustomEditor = defineComponent({
  setup() {
    const { initialValue, confirmEdit, cancelEdit } = useInfiniteColumnEditor(); // #highlight

    const domRef = ref<HTMLInputElement | null>(null);

    onMounted(() => {
      domRef.value?.focus();
    });

    const onKeydown = (event: KeyboardEvent) => {
      const { key } = event;
      if (key === 'Enter' || key === 'Tab') {
        confirmEdit(domRef.value?.value);
      } else if (key === 'Escape') {
        cancelEdit();
      } else {
        event.stopPropagation();
      }
    };

    return () =>
      h('div', [
        h('input', {
          style: { width: '100%' },
          ref: domRef,
          value: initialValue,
          onKeydown,
        }),
      ]);
  },
});
//#endregion

export { CustomEditor };
