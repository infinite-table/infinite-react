// Snippets shown on custom-editor.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import { useCallback } from 'react';
import {
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  stack: string;
  currency: string;
};

export function columnsWithCustomEditor() {
  //#region intro
  const columns: InfiniteTablePropColumns<Developer> = {
    id: {
      field: 'id',
      defaultEditable: false,
    },
    firstName: {
      field: 'firstName',
      components: {
        // this is using a custom editor component
        Editor: CustomEditor, // #highlight
      },
    },
    age: {
      field: 'age',
      type: 'number',
      defaultEditable: false,
    },
    stack: { field: 'stack' },
    currency: { field: 'currency' },
  };
  //#endregion
  return columns;
}

//#region customeditor-tsx
import { useInfiniteColumnEditor } from '@infinite-table/infinite-react';
const CustomEditor = () => {
  const { initialValue, confirmEdit, cancelEdit } = useInfiniteColumnEditor(); // #highlight

  const domRef = React.useRef<HTMLInputElement>(null);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    if (key === 'Enter' || key === 'Tab') {
      confirmEdit(domRef.current?.value);
    } else if (key === 'Escape') {
      cancelEdit();
    } else {
      event.stopPropagation();
    }
  }, []);

  return (
    <div>
      <input
        style={{ width: '100%' }}
        autoFocus
        ref={domRef}
        defaultValue={initialValue}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
//#endregion
