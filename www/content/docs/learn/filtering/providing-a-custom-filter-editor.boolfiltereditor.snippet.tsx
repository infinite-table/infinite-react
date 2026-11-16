// Snippets shown on providing-a-custom-filter-editor.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

type Developer = {
  id: number;
  firstName: string;
  canDesign: boolean;
};

//#region boolfiltereditor
import {
  components,
  useInfiniteColumnFilterEditor,
} from '@infinite-table/infinite-react';

const { CheckBox } = components;

function BoolFilterEditor() {
  const { value, setValue, className } = // #highlight
    useInfiniteColumnFilterEditor<Developer>();
  return (
    <div className={className} style={{ textAlign: 'center' }}>
      <CheckBox
        checked={value}
        onChange={(newValue) => {
          if (value === true) {
            // after the value was true, make it go to indeterminate state
            newValue = null;
          }
          if (value === null) {
            // from indeterminate, goto false
            newValue = false;
          }
          setValue(newValue);
        }}
      />
    </div>
  );
}
//#endregion

// used by the `filterTypes` snippets in providing-a-custom-filter-editor.snippet.tsx
export { BoolFilterEditor };
