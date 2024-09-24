import { DataSourceApi } from '@infinite-table/infinite-react';
import { useEffect } from 'react';

export type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  salary: number;
  monthlyBonus: number;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  reposCount: number;
};

let tickingInterval: NodeJS.Timeout | null = null;

export const TICK_INTERVAL = 50;

export const TICK_BATCH_SIZE = 10;

function singleUpdate(dataSourceApi: DataSourceApi<Developer>) {
  const arr = dataSourceApi.getRowInfoArray();
  const len = arr.length;
  const randomIndex = Math.floor(Math.random() * len);
  const rowInfo = arr[randomIndex];
  const id = rowInfo.id;

  if (rowInfo.isGroupRow) {
    return;
  }

  const salarySign = Math.random() > 0.5 ? 1 : -1;
  const randomSalaryDelta = Math.floor(Math.random() * 5000) * salarySign;
  const monthlyBonusSign = Math.random() > 0.5 ? 1 : -1;
  const randomMonthlyBonusDelta =
    Math.floor(Math.random() * 500) * monthlyBonusSign;

  const salary = Math.max(
    0,
    rowInfo.data.salary * 1 + randomSalaryDelta,
    10000,
  );
  const monthlyBonus = Math.max(
    0,
    rowInfo.data.monthlyBonus * 1 + randomMonthlyBonusDelta,
  );
  dataSourceApi.updateData({
    id,
    salary,
    monthlyBonus,
  });
}
function start(
  dataSourceApi: DataSourceApi<Developer>,
  options: {
    batchSize?: number;
    interval?: number;
  } = {},
) {
  tickingInterval = setInterval(() => {
    const len = dataSourceApi.getRowInfoArray().length;

    Array.from({
      length: Math.ceil(len / (options.batchSize ?? TICK_BATCH_SIZE)),
    }).forEach(() => {
      singleUpdate(dataSourceApi);
    });
  }, options.interval ?? TICK_INTERVAL);
}

function stop() {
  if (tickingInterval) {
    clearInterval(tickingInterval);
  }
}

export function useTickingData(
  dataSourceApi: DataSourceApi<Developer> | null,
  tick: boolean,
  options: {
    batchSize?: number;
    interval?: number;
  } = {},
) {
  useEffect(() => {
    if (!dataSourceApi) {
      return;
    }

    if (tick) {
      start(dataSourceApi, options);
    } else {
      stop();
    }
  }, [dataSourceApi, tick]);
}
