import {
  InfiniteTable,
  DataSource,
  DataSourceData,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage', header: 'Language' },
  country: { field: 'country', header: 'Country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

export default function KeyboardShortcuts() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          columns={columns}
          keyboardShortcuts={[
            {
              key: 'Shift+Enter',
              when: (context) => !!context.getState().activeCellIndex,
              handler: (context) => {
                const { activeCellIndex } = context.getState();

                const [rowIndex, columnIndex] = activeCellIndex!;
                alert(
                  `Current active cell: row ${rowIndex}, column ${columnIndex}.`,
                );
              },
            },
            {
              key: 'PageUp',
              handler: () => {
                console.log('PageUp key pressed.');
              },
            },
            {
              key: 'PageDown',
              handler: () => {
                console.log('PageDown key pressed.');
              },
            },
          ]}
        />
      </DataSource>
    </>
  );
}
