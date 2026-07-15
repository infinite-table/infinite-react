import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import { DataSource } from '@infinite-table/infinite-react';

import { type Developer, data as baseData, height100DomProps } from './common';

const data: Developer[] = [{ ...baseData[0], currency: 'USDx' }, ...baseData.slice(1)];

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
  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
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
            shouldAcceptEdit={({ column }) => {
              if (column.id === 'id') {
                return false;
              }
              if (column.id === 'currency') {
                return new Promise((resolve) => {
                  setTimeout(() => {
                    resolve(false);
                  }, 200);
                });
              }
              if (column.id === 'firstName') {
                return new Promise((resolve) => {
                  setTimeout(() => {
                    resolve(true);
                  }, 200);
                });
              }
              return true;
            }}
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
