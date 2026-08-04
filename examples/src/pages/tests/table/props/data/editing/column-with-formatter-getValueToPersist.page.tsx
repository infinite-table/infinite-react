import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import { type Developer as BaseDeveloper, developersData5, height100DomProps } from '../common';

type Developer = BaseDeveloper & { salary: number };

const data: Developer[] = developersData5.map((row, i) => ({
  ...row,
  salary: [123, 11000, 12000, 21000, 9000][i],
}));

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
    style: ({ inEdit }) => {
      return inEdit
        ? {
            fontSize: 30,
          }
        : {};
    },
  },
  age: {
    field: 'age',
    type: 'number',
    defaultEditable: false,
  },
  stack: {
    field: 'stack',
    renderMenuIcon: false,
    valueGetter: ({ data }) => `Stack: ${data.stack}`,
  },
  currency: { field: 'currency' },
  salary: {
    field: 'salary',
    style: ({ rawValue }) => {
      return rawValue > 1000
        ? {
            color: 'red',
          }
        : { color: 'blue' };
    },
    valueFormatter: ({ value }) => `$ ${value}`,
    getValueToPersist: ({ value }) => {
      if (value === '234') {
      }
      return parseInt(value, 10) * 2;
    },
  },
};

const sinon = require('sinon');

const onEditCancelled = sinon.spy(() => {});
const onEditRejected = sinon.spy(() => {});
const onEditAccepted = sinon.spy(() => {});

(globalThis as any).onEditCancelled = onEditCancelled;
(globalThis as any).onEditAccepted = onEditAccepted;
(globalThis as any).onEditRejected = onEditRejected;

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer> data={data} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={height100DomProps}
            onEditCancelled={onEditCancelled}
            onEditAccepted={onEditAccepted}
            onEditRejected={onEditRejected}
            columnDefaultEditable
            columnDefaultWidth={150}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
