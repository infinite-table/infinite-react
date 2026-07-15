import {
  InfiniteTable,
  DataSource,
  DataSourceData,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useMemo } from 'react';
import { useState } from 'react';

import {
  columns,
  developers1kDataSource,
  type Developer,
} from './common';

export default function KeyboardNavigationForRows() {
  const [color, setColor] = useState({
    r: 77,
    // r: 255,
    g: 0,
    // g: 0,
    b: 215,
    // b: 0,
  });

  const defaultColor = `#${color.r.toString(16)}${color.g
    .toString(16)
    .padEnd(2, '0')}${color.b.toString(16)}`;

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
    <div>
      <input />
      <div>
        <input
          type="color"
          onChange={onColorChange}
          defaultValue={defaultColor}
        />
      </div>

      <DataSource<Developer>
        primaryKey="id"
        data={developers1kDataSource as DataSourceData<Developer>}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
        />
      </DataSource>
      <input />
    </div>
  );
}
