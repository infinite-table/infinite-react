import {
  DataSource,
  DataSourceData,
  InfiniteTable,
} from '@infinite-table/infinite-react';
import { Template } from '../src/Template';
import { useState } from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers50k-sql`).then(
    (r) => r.json(),
  );
};

export default function () {
  const [dataFn, setDataFn] = useState(() => dataSource);
  return (
    <>
      <button
        style={{ flex: 'none' }}
        onClick={() => {
          for (let i = 0; i < 20; i++) {
            setTimeout(() => {
              setDataFn((fn: DataSourceData<Developer>) => {
                return typeof fn === 'function' ? fn.bind(null) : fn;
              });
            }, i * 20);
          }
        }}
      >
        trigger data warning
      </button>
      <DataSource
        primaryKey={'id'}
        data={dataFn}
        shouldReloadData={true}
        defaultGroupBy={[
          {
            field: 'country',
          },
          {
            field: 'age',
          },
        ]}
      >
        <InfiniteTable
          debugId="hello world"
          columns={{
            name: {
              field: 'firstName',
            },
            anotherName: {
              field: 'lastName',
            },
            age: {
              field: 'age',
            },
            salary: {
              field: 'salary',
            },
            city: {
              field: 'city',
            },
            country: {
              field: 'country',
            },
            currency: {
              field: 'currency',
            },
            stack: {
              field: 'stack',
            },
            canDesign: {
              field: 'canDesign',
            },
          }}
        />
      </DataSource>
      <DataSource primaryKey={'id'} data={dataFn} defaultSortInfo={[]}>
        <InfiniteTable
          debugId="small data"
          columns={{
            name: {
              field: 'firstName',
            },
            lastName: {
              field: 'lastName',
            },
            age: {
              field: 'age',
            },
          }}
        />
      </DataSource>
      <Template />
    </>
  );
}
