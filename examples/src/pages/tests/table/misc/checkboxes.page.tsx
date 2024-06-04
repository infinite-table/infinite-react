import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';

interface FakeData {
  id: number;
  text: string;
  checked: boolean;
}

const initialData: FakeData[] = [
  {
    id: 1,
    text: 'one',
    checked: true,
  },
  {
    id: 2,
    text: 'two',
    checked: false,
  },
  {
    id: 3,
    text: 'three',
    checked: false,
  },
  {
    id: 4,
    text: 'four',
    checked: false,
  },
  {
    id: 5,
    text: 'five',
    checked: false,
  },
  {
    id: 6,
    text: 'six',
    checked: false,
  },
  {
    id: 7,
    text: 'seven',
    checked: false,
  },
  {
    id: 8,
    text: 'eight',
    checked: false,
  },
  {
    id: 9,
    text: 'nine',
    checked: false,
  },
];

export default () => {
  const [rowHeight] = React.useState(50);
  const [data, setData] = React.useState(initialData);
  const renderRow = (
    data: Partial<FakeData> | null,
  ): React.ReactElement | null => {
    const item = data;
    if (!item) {
      return null;
    }
    return (
      <div
        style={{ width: '180vw', border: '1px solid red' }}
        onClick={() => {
          setData(
            initialData.map((dataItem) => {
              const result = { ...dataItem };
              if (dataItem.id === item.id) {
                result.checked = !item.checked;
              }
              return result;
            }),
          );
        }}
      >
        {item.text} checked - {`${item.checked ? 'yes' : 'no'}`}
      </div>
    );
  };

  return (
    <React.StrictMode>
      <p>
        Table is configured with <b>sortable=false</b> on this page, but the{' '}
        <b>Id</b> column specifically configured as <b>sortable=true</b>
      </p>
      <DataSource<FakeData>
        data={data}
        primaryKey="id"
        fields={['id', 'text', 'checked']}
      >
        <InfiniteTable<FakeData>
          domProps={{
            style: {
              margin: '5px',
              height: 300,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnDefaultWidth={150}
          sortable={false}
          rowHeight={rowHeight}
          columns={{
            id: {
              field: 'id',
              type: 'number',
              defaultSortable: true,
            },
            text: {
              field: 'text',
            },
            checked: {
              field: 'checked',
              render: ({ data }: { data: Partial<FakeData> | null }) => {
                return renderRow(data);
              },
            },
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
};
