// Snippets shown on the Vue version of providing-a-custom-filter-editor.page.md: the sibling of
// providing-a-custom-filter-editor.boolfiltereditor.snippet.tsx, with the same `#region` names.
// Type-checked with vue-tsc against the library source (`npm run tsc:vue`).

type Developer = {
  id: number;
  firstName: string;
  canDesign: boolean;
};

//#region boolfiltereditor
import { defineComponent, h } from 'vue';
import {
  components,
  useInfiniteColumnFilterEditor,
} from '@infinite-table/infinite-vue';

const { CheckBox } = components;

const BoolFilterEditor = defineComponent({
  setup() {
    const { value, setValue, className } = // #highlight
      useInfiniteColumnFilterEditor<Developer>();

    return () =>
      h('div', { class: className, style: { textAlign: 'center' } }, [
        h(CheckBox, {
          checked: value.value,
          onChange: (newValue) => {
            if (value.value === true) {
              // after the value was true, make it go to indeterminate state
              newValue = null;
            }
            if (value.value === null) {
              // from indeterminate, goto false
              newValue = false;
            }
            setValue(newValue);
          },
        }),
      ]);
  },
});
//#endregion

// used by the `filterTypes` snippets in providing-a-custom-filter-editor.snippet.vue.ts
export { BoolFilterEditor };
