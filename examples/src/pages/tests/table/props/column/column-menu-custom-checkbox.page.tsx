import * as React from 'react';

import {
  DataSource,
  DataSourceData,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  currency: string;
};

const dataSource: DataSourceData<Developer> = () => {
  return [
    { id: 1, firstName: 'John', country: 'USA', currency: 'USD' },
    { id: 2, firstName: 'Bill', country: 'USA', currency: 'USD' },
    { id: 3, firstName: 'Nat', country: 'Canada', currency: 'CAD' },
  ];
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  country: { field: 'country' },
  currency: { field: 'currency' },
};

const CustomCheckBox = (props: {
  checked?: boolean | null;
  disabled?: boolean;
  onChange?: (checked: boolean | null) => void;
}) => {
  return (
    <input
      type="checkbox"
      data-name="custom-checkbox"
      checked={!!props.checked}
      disabled={props.disabled}
      onChange={(event) => props.onChange?.(event.target.checked)}
    />
  );
};

const components = {
  CheckBox: CustomCheckBox,
};

const App = () => {
  return (
    <React.StrictMode>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnDefaultWidth={140}
          columns={columns}
          components={components}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
