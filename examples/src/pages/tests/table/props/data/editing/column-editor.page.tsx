import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  useInfiniteColumnEditor,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { useCallback } from 'react';

import {
  type Developer,
  data,
  height100DomProps,
} from './common';

const CustomEditor = () => {
  const { initialValue, confirmEdit, cancelEdit } = useInfiniteColumnEditor();

  const domRef = React.useRef<HTMLInputElement>(null);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    if (key === 'Enter' || key === 'Tab') {
      confirmEdit(domRef.current?.value + 'ABC');
    } else if (key === 'Escape') {
      cancelEdit();
    } else {
      event.stopPropagation();
    }
  }, []);

  return (
    <div style={{ border: '2px solid red' }}>
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

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
    components: {
      Editor: CustomEditor,
    },
  },
  age: {
    field: 'age',
    type: 'number',
    defaultEditable: false,
  },
  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer> data={data} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={height100DomProps}
            columnDefaultEditable
            columnDefaultWidth={150}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
