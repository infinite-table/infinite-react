import {
  InfiniteTable,
  DataSource,
  DataSourceData,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';
import { useMemo } from 'react';
import { useState } from 'react';

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
  return fetch(
    'https://infinite-table.com/.netlify/functions/json-server' +
      `/developers1k-sql?`
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  country: { field: 'country' },
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

export default function KeyboardNavigationForRows() {
  const [color, setColor] = useState({
    r: 77,
    g: 149,
    b: 215,
  });

  const defaultColor = `#${color.r.toString(
    16
  )}${color.g.toString(16)}${color.b.toString(16)}`;

  const domProps = useMemo(() => {
    return {
      style: {
        height: '90vh',
        '--infinite-active-cell-border-color--r': color.r,
        '--infinite-active-cell-border-color--g': color.g,
        '--infinite-active-cell-border-color--b': color.b,
      },
    };
  }, [color]);

  const onColorChange = (event: any) => {
    const color = event.target.value;

    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);

    setColor({
      r,
      g,
      b,
    });
  };

  console.log(color, domProps.style);
  return (
    <>
      <div>
        <input
          type="color"
          onChange={onColorChange}
          defaultValue={defaultColor}
        />
      </div>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}>
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          defaultActiveRowIndex={0}
        />
      </DataSource>
    </>
  );
}
