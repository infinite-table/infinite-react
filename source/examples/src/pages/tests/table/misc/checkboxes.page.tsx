import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTableFactory,
} from '@components/InfiniteTable';
import { DataSource } from '@src/components/DataSource';

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

const Table = InfiniteTableFactory<FakeData>();
export default () => {
  const [rowHeight] = React.useState(50);
  const [data, setData] = React.useState(initialData);
  const renderRow = (data: FakeData): React.ReactElement => {
    const item = data;
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

  console.log(data);

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
        <Table
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
          columns={
            new Map(
              [
                {
                  field: 'id',
                  type: 'number',
                  sortable: true,
                },
                {
                  field: 'text',
                },
                {
                  field: 'checked',
                  render: ({ data }: { data: FakeData }) => {
                    return renderRow(data);
                  },
                },
              ].map((c) => [c.field, c as InfiniteTableColumn<FakeData>]),
            )
          }
        />
      </DataSource>
    </React.StrictMode>
  );
};
