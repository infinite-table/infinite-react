import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import {
  type DeveloperWithSalary,
  dataWithSalary as data,
  height100DomProps,
} from './common';

type Developer = DeveloperWithSalary;

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
  salary: {
    field: 'salary',
    getValueToEdit: ({ value }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(value.substr(1).trim());
        }, 200);
      });
    },
    getValueToPersist: ({ value, initialValue }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(`${initialValue[0]} ${value}`);
        }, 200);
      });
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
