import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  debounce,
} from '@infinite-table/infinite-react@prerelease';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react@prerelease';
import * as React from 'react';
import { useState } from 'react';
import { useMemo } from 'react';
import { HTMLProps } from 'react';
import { ChangeEvent } from 'react';

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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql`)
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

const domProps = { style: { height: '90vh' } };

const rgb = {
  r: 77,
  g: 149,
  b: 215,
};
const defaultColor = `#${rgb.r.toString(16)}${rgb.g.toString(
  16,
)}${rgb.b.toString(16)}`;

export default function KeyboardNavigationTheming() {
  const [color, setColor] = useState({
    ...rgb,
  });

  const domProps = useMemo(() => {
    return {
      style: {
        '--infinite-active-cell-border-color--r': color.r,
        '--infinite-active-cell-border-color--g': color.g,
        '--infinite-active-cell-border-color--b': color.b,
        // for the same of the example being more obvious,
        // make the opacity of the unfocused table same as the one used on focus
        '--infinite-active-cell-background-alpha--table-unfocused': '0.25', // but this defaults to 0.1
      },
    } as HTMLProps<HTMLDivElement>;
  }, [color]);

  const onChange = useMemo(() => {
    const onColorChange = (event: ChangeEvent<HTMLInputElement>) => {
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
    return debounce(onColorChange, { wait: 200 });
  }, []);

  return (
    <>
      <div
        style={{
          color: 'var(--infinite-cell-color)',
        }}
      >
        Select color{' '}
        <input type="color" onChange={onChange} defaultValue={defaultColor} />
      </div>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          defaultActiveCellIndex={[5, 0]}
          domProps={domProps}
          columns={columns}
        />
      </DataSource>
    </>
  );
}
