import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  DataSourceApi,
  InfiniteTableApi,
  DataSourceDataFn,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';
import { Button } from '@/components/ui/button';

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

const columns: InfiniteTablePropColumns<Developer> = {
  // id: { field: 'id' },
  salary: { field: 'salary' },
  age: { field: 'age' },
  firstName: { field: 'firstName' },
  // preferredLanguage: { field: 'preferredLanguage' },
  // lastName: { field: 'lastName' },
  // country: { field: 'country' },
  // city: { field: 'city' },
  // currency: { field: 'currency' },
  // stack: { field: 'stack' },
  // canDesign: { field: 'canDesign' },
};

const dataSourceFn: DataSourceDataFn<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql`)
    .then((r) => r.json())
    .then((data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          // console.log(data, 'data');
          // data.length = 1;
          // const newData = [...data.data.slice(0, 3)];
          const newData = data;

          resolve(newData);
        }, 20);
      });
    });
};

export default function DataTestPage() {
  const [active] = React.useState([true, true]);
  const [ds, setDs] = React.useState<DataSourceDataFn<Developer>>(
    () => dataSourceFn,
  );
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<Developer>>();
  const [activeCellIndex, setActiveCellIndex] = React.useState<
    [number, number] | null
  >(null);
  const [api, setApi] = React.useState<InfiniteTableApi<Developer>>();
  const [header, setHeader] = React.useState<boolean>(false);

  const onReady = React.useCallback(
    ({
      dataSourceApi,
      api,
    }: {
      dataSourceApi: DataSourceApi<Developer>;
      api: InfiniteTableApi<Developer>;
    }) => {
      setDataSourceApi(dataSourceApi);
      setApi(api);
    },
    [],
  );

  const domProps: InfiniteTableProps<Developer>['domProps'] =
    React.useMemo(() => {
      return {
        style: {
          margin: '5px',
          height: 900,
          border: '1px solid gray',
          position: 'relative',
        },
      };
    }, []);
  return (
    <React.StrictMode>
      <div className="flex gap-2 items-center justify-center m-1">
        <Button
          onClick={() => {
            if (!dataSourceApi || !api) {
              return;
            }

            const { start, end } = api.getVisibleRenderRange();
            const [startRow, startCol] = start;
            const [endRow, endCol] = end;
            // console.log(start, end);

            const randomRow =
              Math.floor(Math.random() * (endRow - startRow + 1)) + startRow;
            const randomCol =
              Math.floor(Math.random() * (endCol - startCol + 1)) + startCol;

            const [activeRow, activeCol] = activeCellIndex || [];

            const updateRow = activeRow ?? randomRow;
            const updateCol = activeCol ?? randomCol;
            const colId = Object.keys(columns)[updateCol];
            const rowId = dataSourceApi.getPrimaryKeyByIndex(updateRow);
            dataSourceApi.updateData({
              [colId]: Math.floor(Math.random() * 10000),
              id: rowId,
            });

            // dataSourceApi.get
            // dataSourceApi.;
          }}
        >
          update
        </Button>
        <Button
          onClick={() => {
            setDs(dataSourceFn.bind(null));
          }}
        >
          update datasource
        </Button>
        <Button
          onClick={() => {
            setHeader((header) => !header);
          }}
        >
          toggle header
        </Button>
      </div>
      {active[0] && (
        <DataSource<Developer> data={ds} primaryKey="id">
          <InfiniteTable<Developer>
            header={header}
            onActiveCellIndexChange={setActiveCellIndex}
            debugId="test"
            onReady={onReady}
            domProps={domProps}
            columns={columns}
          />
        </DataSource>
      )}
    </React.StrictMode>
  );
}
