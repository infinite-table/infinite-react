import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTable,
  InfiniteTableApi,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  salary: number;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  reposCount: number;
};

const dataSource = () => {
  return fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => {
      return data;
    });
};

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const CURRENCIES = ['USD', 'CAD', 'EUR'];
const stacks = ['frontend', 'backend', 'fullstack'];

const updateRow = (api: DataSourceApi<Developer>, data: Developer) => {
  const getDelta = (num: number): number => Math.ceil(0.2 * num);

  const initialData = data;
  if (!initialData) {
    return;
  }
  const salaryDelta = getDelta(initialData?.salary);
  const reposCountDelta = getDelta(initialData?.reposCount);
  const newSalary =
    initialData.salary + getRandomInt(-salaryDelta, salaryDelta);
  const newReposCount =
    initialData.reposCount + getRandomInt(-reposCountDelta, reposCountDelta);

  let newData: Partial<Developer> = {
    id: initialData.id,
    salary: newSalary,
    reposCount: newReposCount,
    currency:
      CURRENCIES[getRandomInt(0, CURRENCIES.length - 1)] || CURRENCIES[0],
    stack: stacks[getRandomInt(0, stacks.length - 1)] || stacks[0],
    age: getRandomInt(0, 100),
  };

  api.updateData(newData);
};

let STARTED = false;

const ROWS_TO_UPDATE_PER_FRAME = 5;
const UPDATE_INTERVAL_MS = 30;

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
    style: ({ value, rowInfo }) => {
      if (rowInfo.isGroupRow) {
        return {};
      }

      return {
        color: 'black',
        background:
          value > 80
            ? 'tomato'
            : value > 60
            ? 'orange'
            : value > 40
            ? 'yellow'
            : value > 20
            ? 'lightgreen'
            : 'green',
      };
    },
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  reposCount: {
    field: 'reposCount',
    type: 'number',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const domProps = {
  style: {
    height: '100%',
  },
};
export default () => {
  let [running, setRunning] = React.useState(false);

  const [apis, onReady] = React.useState<{
    api: InfiniteTableApi<Developer>;
    dataSourceApi: DataSourceApi<Developer>;
  }>();

  const intervalIdRef = React.useRef<any>();

  React.useEffect(() => {
    const { current: intervalId } = intervalIdRef;

    if (!running || !apis) {
      return clearInterval(intervalId);
    }

    intervalIdRef.current = setInterval(() => {
      const { dataSourceApi, api } = apis!;
      const { renderStartIndex, renderEndIndex } = api.getVerticalRenderRange();
      const dataArray = dataSourceApi.getRowInfoArray();
      const data = dataArray
        .slice(renderStartIndex, renderEndIndex)
        .map((x) => x.data as Developer);

      for (let i = 0; i < ROWS_TO_UPDATE_PER_FRAME; i++) {
        const row = data[getRandomInt(0, data.length - 1)];
        if (row) {
          updateRow(dataSourceApi, row);
        }
      }

      return () => {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      };
    }, UPDATE_INTERVAL_MS);
  }, [running, apis]);

  return (
    <React.StrictMode>
      <button
        style={{
          border: '2px solid magenta',
          display: 'inline-block',
          background: running ? 'tomato' : 'white',
          color: running ? 'white' : 'tomato',
        }}
        onClick={() => {
          setRunning(!running);
        }}
      >
        {running ? 'Stop' : 'Start'} updates
      </button>
      <DataSource<Developer> data={dataSource} primaryKey="id">
        <InfiniteTable<Developer>
          domProps={domProps}
          onReady={onReady}
          columnDefaultWidth={130}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};
