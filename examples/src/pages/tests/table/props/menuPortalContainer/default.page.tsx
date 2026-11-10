import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
  InfiniteTablePropGetCellContextMenuItems,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'John', age: 20 },
  { id: 2, firstName: 'Marry', age: 25 },
];

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
  age: { field: 'age', type: 'number' },
};

const extraItems = Array.from({ length: 8 }, (_, index) => ({
  key: `extra-${index}`,
  label: `Extra ${index}`,
}));

const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<
  Developer
> = () => extraItems;

export default () => {
  const portalRef = React.useRef<HTMLDivElement>(null);
  const constrainRef = React.useRef<HTMLDivElement>(null);

  return (
    <React.StrictMode>
      <div
        data-name="constrain"
        ref={constrainRef}
        style={{ position: 'relative', width: 800, height: 600 }}
      >
        <div
          data-name="clip"
          style={{ width: 400, height: 120, overflow: 'hidden' }}
        >
          <DataSource<Developer> data={data} primaryKey="id">
            <InfiniteTable<Developer>
              domProps={{ style: { width: 400, height: 120 } }}
              columns={columns}
              columnDefaultWidth={150}
              getCellContextMenuItems={getCellContextMenuItems}
              menuPortalContainer={() => portalRef.current}
              menuConstrainTo={() => constrainRef.current}
            />
          </DataSource>
        </div>
        <div data-name="portal" ref={portalRef} />
      </div>
    </React.StrictMode>
  );
};
