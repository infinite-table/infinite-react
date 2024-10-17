import * as React from 'react';

import {
  DataSourceData,
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSource,
  InfiniteTableColumn,
  useInfiniteHeaderCell,
  alignNode,
  useInfinitePortalContainer,
} from '@infinite-table/infinite-react';
import { createPortal } from 'react-dom';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

function ColumnFilterMenuIcon() {
  const {
    renderBag,
    htmlElementRef: alignToRef,
    column,
  } = useInfiniteHeaderCell();

  const portalContainer = useInfinitePortalContainer();

  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!domRef.current || !alignToRef.current) {
      return;
    }

    alignNode(domRef.current, {
      alignTo: alignToRef.current,
      alignPosition: [
        ['TopRight', 'BottomRight'],
        ['TopRight', 'BottomRight'],
      ],
    });
  });

  const domRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      onMouseDown={(e) => {
        if (e.nativeEvent) {
          // @ts-ignore
          e.nativeEvent.__insideMenu = column.id;
        }
      }}
      onPointerDown={(event) => {
        event.stopPropagation();

        if (visible) {
          setVisible(false);
          return;
        }

        setVisible(true);

        function handleMouseDown(event: MouseEvent) {
          // @ts-ignore
          if (event.__insideMenu !== column.id) {
            setVisible(false);
            document.documentElement.removeEventListener(
              'mousedown',
              handleMouseDown,
            );
          }
        }
        document.documentElement.addEventListener('mousedown', handleMouseDown);
      }}
    >
      <FilterIcon />
      {createPortal(
        <div
          ref={domRef}
          style={{
            position: 'absolute',
            color: 'white',
            top: 0,
            overflow: 'visible',
            background: 'var(--infinite-background)',
            border: `var(--infinite-cell-border)`,
            left: 0,
            width: column.computedWidth,
            padding: 10,
            display: visible ? 'block' : 'none',
          }}
        >
          {renderBag.filterEditor}
        </div>,
        portalContainer!,
      )}
    </div>
  );
}

const customHeaderWithFilterMenu: InfiniteTableColumn<any>['renderHeader'] = ({
  renderBag,
}) => {
  return (
    <>
      {renderBag.header}
      <div style={{ flex: 1 }}></div>

      {renderBag.filterIcon}

      {renderBag.menuIcon}
      <ColumnFilterMenuIcon />
    </>
  );
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
    renderHeader: customHeaderWithFilterMenu,
  },
  salary: {
    field: 'salary',
    type: 'number',
    renderHeader: customHeaderWithFilterMenu,
  },

  firstName: {
    field: 'firstName',
    renderHeader: customHeaderWithFilterMenu,
  },
  stack: { field: 'stack', renderHeader: customHeaderWithFilterMenu },
  currency: { field: 'currency', renderHeader: customHeaderWithFilterMenu },
};

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          defaultFilterValue={[]}
          shouldReloadData={{
            filterValue: false,
            sortInfo: false,
            groupBy: false,
            pivotBy: false,
          }}
        >
          <InfiniteTable<Developer>
            showColumnFilters={false}
            columnDefaultWidth={150}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
