import {
  DataSource,
  DataSourceData,
  InfiniteTable,
} from '@infinite-table/infinite-react';
import { Template } from '../src/Template';

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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100`).then((r) =>
    r.json(),
  );
};

export default function () {
  return (
    <>
      <DataSource
        primaryKey={'id'}
        data={dataSource}
        defaultGroupBy={[{ field: 'country' }]}
      >
        <InfiniteTable
          debugId="theme-demo"
          domProps={{ style: { height: '45vh' } }}
          columns={{
            name: { field: 'firstName' },
            age: { field: 'age' },
            salary: { field: 'salary' },
            city: { field: 'city' },
            country: { field: 'country' },
            stack: { field: 'stack' },
          }}
        />
      </DataSource>
      <Template />
    </>
  );
}
