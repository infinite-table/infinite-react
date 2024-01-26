import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  useInfiniteColumnCell,
  DataSourceData,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Bobson',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
    {
      id: 2,
      firstName: 'Bill',
      lastName: 'Richardson',
      country: 'USA',
      city: 'NY',
      currency: 'USD',
    },
  ];
};

const CountryComponent = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, renderBag } = useInfiniteColumnCell<Developer>();

  const style = {
    padding: '5px 20px',
    ...props.style,
  };
  return (
    <div ref={domRef} {...props} style={style}>
      START:{renderBag.value}!END
    </div>
  );
};

function Country() {
  const { renderBag } = useInfiniteColumnCell<Developer>();
  console.log('renderBag');
  return <>Country: {renderBag.value}</>;
}

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  country: {
    field: 'country',
    renderValue: () => <Country />,
    defaultWidth: 250,
    components: {
      ColumnCell: CountryComponent,
    },
  },
  firstName: {
    field: 'firstName',
  },
  preferredLanguage: {
    field: 'currency',
  },
};

export default function ColumnValueGetterExample() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          columns={columns}
          domProps={{
            style: {
              height: 500,
            },
          }}
        />
      </DataSource>
    </>
  );
}
