import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import {
  type Developer,
  data,
  height100DomProps,
} from './common';

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
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
const onEditAccepted = sinon.spy(() => {});
const onEditPersistError = sinon.spy(() => {});
const onEditPersistSuccess = sinon.spy(() => {});

(globalThis as any).onEditCancelled = onEditCancelled;
(globalThis as any).onEditAccepted = onEditAccepted;
(globalThis as any).onEditPersistError = onEditPersistError;
(globalThis as any).onEditPersistSuccess = onEditPersistSuccess;

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer> data={data} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={height100DomProps}
            onEditCancelled={onEditCancelled}
            onEditAccepted={(params) => {
              console.log(params.rowInfo);
            }}
            onEditPersistError={onEditPersistError}
            onEditPersistSuccess={onEditPersistSuccess}
            persistEdit={({ value, dataSourceApi, data, column }) => {
              if (column.id === 'id') {
                return new Error('Cannot edit id');
              }
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve(
                    dataSourceApi.updateData({
                      ...data,
                      [column.field!]: value + '!',
                    }),
                  );
                }, 200);
              });
            }}
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
