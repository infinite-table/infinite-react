import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSource,
  useInfiniteHeaderCell,
  useInfinitePortalContainer,
  alignNode,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import { createPortal } from 'react-dom';
import { FilterIcon } from 'lucide-react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

function ColumnFilterMenuIcon() {
  const { renderBag, htmlElementRef: alignToRef } = useInfiniteHeaderCell();

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
          e.nativeEvent.__insideMenu = true;
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
          if (event.__insideMenu !== true) {
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
      <FilterIcon size={16} />
      {createPortal(
        <div
          ref={domRef}
          style={{
            position: 'absolute',
            color: 'white',
            top: 0,
            overflow: 'visible',
            background: 'var(--infinite-background)',
            border: `1px solid currentColor`,
            left: 0,
            width: 200,
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

const customHeader: InfiniteTableColumn<any>['renderHeader'] = ({
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
  firstName: {
    field: 'firstName',
    renderHeader: customHeader,
    defaultFilterable: false,
  },
  age: {
    field: 'age',
    type: 'number',

    renderHeader: customHeader,
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          defaultFilterValue={[]}
        >
          <InfiniteTable<Developer>
            domProps={{
              style: {
                margin: '5px',

                height: '80vh',
                width: '80vw',
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            showColumnFilters={true}
            columnDefaultWidth={300}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
