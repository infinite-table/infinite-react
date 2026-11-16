import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  useInfiniteColumnFilterEditor,
} from '@infinite-table/infinite-react';
import type {
  DataSourcePropFilterTypes,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import {
  data,
  textOperators,
  stackOperatorFns,
  type Developer,
} from './custom-filter-operator-switch.data';

// keeps the input inside its header cell
const editorStyle: React.CSSProperties = { flex: 1, minWidth: 0, width: 0 };

// an editor that writes the value it is given
function TextFilterEditor() {
  const { value, setValue, ariaLabel } =
    useInfiniteColumnFilterEditor<Developer>();

  return (
    <input
      data-name="custom-editor"
      aria-label={ariaLabel}
      style={editorStyle}
      value={value ?? ''}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}

// replaces the default operator switch: a button that goes to the next operator
function OperatorSwitch() {
  const { api, column, operatorName, filterType } =
    useInfiniteColumnFilterEditor<Developer>();

  const names = filterType.operators.map((operator) => operator.name);
  const next = names[(names.indexOf(operatorName!) + 1) % names.length];

  return (
    <button
      data-name="custom-switch"
      onClick={() => api.setColumnFilterOperator(column.id, next)}
    >
      {operatorName}
    </button>
  );
}

const filterTypes: DataSourcePropFilterTypes<Developer> = {
  text: {
    label: 'Text',
    defaultOperator: 'startsWith',
    emptyValues: [''],
    components: {
      FilterEditor: TextFilterEditor,
      FilterOperatorSwitch: OperatorSwitch,
    },
    operators: textOperators,
  },
  stack: {
    label: 'Stack',
    defaultOperator: 'is',
    emptyValues: [''],
    operators: [
      {
        name: 'is',
        fn: stackOperatorFns.is,
        components: {
          Icon: () => <span data-name="icon-is">=</span>,
        },
      },
      {
        name: 'isNot',
        fn: stackOperatorFns.isNot,
        components: {
          Icon: () => <span data-name="icon-isNot">!=</span>,
        },
      },
    ],
  },
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultFilterable: false },
  firstName: { field: 'firstName', filterType: 'text' },
  stack: { field: 'stack', filterType: 'stack' },
};

const domProps = {
  style: {
    height: '100%',
  },
};

export default () => {
  return (
    <DataSource<Developer>
      data={data}
      primaryKey="id"
      defaultFilterValue={[]}
      filterDelay={0}
      filterTypes={filterTypes}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columnDefaultWidth={200}
        columns={columns}
      />
    </DataSource>
  );
};
