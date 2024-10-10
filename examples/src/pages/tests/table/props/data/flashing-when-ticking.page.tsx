import { DataSourceApi } from '@infinite-table/infinite-react';
import { useEffect } from 'react';

type Developer = {
  birthDate: string;
  id: number;
  firstName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  hobby: string;
  salary: number;
};

export const TICK_INTERVAL = 100;

let tickingInterval: any | null = null;

function singleUpdate(dataSourceApi: DataSourceApi<Developer>) {
  const arr = dataSourceApi.getRowInfoArray();
  const len = arr.length;
  const randomIndex = Math.floor(Math.random() * len);
  const rowInfo = arr[randomIndex];
  const id = rowInfo.id;

  if (rowInfo.isGroupRow) {
    return;
  }

  const currentData = rowInfo.data;

  // generate random signs for the updates for each column
  const sign = Math.random() > 0.5 ? 1 : -1;
  const currentSalary = currentData.salary;

  const randomDelta = Math.round(Math.random() * Math.abs(currentSalary * 0.1));

  const newSalary = Math.max(currentSalary + randomDelta * sign, 1000);

  const partialData: Partial<Developer> = {
    id,
    salary: newSalary,
  };
  dataSourceApi.updateData(partialData);
}
function start(dataSourceApi: DataSourceApi<Developer>) {
  tickingInterval = setInterval(() => {
    singleUpdate(dataSourceApi);
  }, TICK_INTERVAL);
}

function stop() {
  if (tickingInterval) {
    clearInterval(tickingInterval);
  }
}

export function useTickingData(
  dataSourceApi: DataSourceApi<Developer> | null,
  tick: boolean,
) {
  useEffect(() => {
    if (!dataSourceApi) {
      return;
    }

    if (tick) {
      start(dataSourceApi);
    } else {
      stop();
    }
  }, [dataSourceApi, tick]);
}

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  // FlashingColumnCell,
  createFlashingColumnCellComponent,
} from '@infinite-table/infinite-react';
import * as React from 'react';

const FlashingColumnCell = createFlashingColumnCellComponent({
  flashDuration: 1000,
  flashClassName: 'flash-cell',
});
const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultEditable: true,
    getValueToPersist: ({ value }) => {
      return value * 1;
    },
    components: {
      ColumnCell: FlashingColumnCell,
    },
  },
};

export default function App() {
  const [ticking, setTicking] = React.useState(false);
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<Developer> | null>(null);

  useTickingData(dataSourceApi, ticking);

  return (
    <>
      <div
        className={`infinite-theme-mode--dark infinite-theme-name--ocean`}
        style={{
          display: 'flex',
          flexFlow: 'column',
          flex: 1,
          color: 'var(--infinite-cell-color)',
          background: 'var(--infinite-background)',
        }}
      >
        <div style={{ paddingBlock: 10 }}>
          <button
            onClick={() => {
              setTicking((x) => !x);
            }}
          >
            {ticking ? 'Stop' : 'Start'} updates
          </button>
        </div>

        <DataSource<Developer>
          data={dataSource}
          primaryKey="id"
          onReady={setDataSourceApi}
        >
          <InfiniteTable<Developer>
            columns={columns}
            domProps={{
              style: {
                height: '80%',
              },
            }}
          />
        </DataSource>
      </div>
    </>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => {
      console.log(data);
      return data;
    });
};
