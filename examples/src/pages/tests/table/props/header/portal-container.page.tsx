import * as React from 'react';
import { createPortal } from 'react-dom';

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  alignNode,
  useInfiniteHeaderCell,
  useInfinitePortalContainer,
} from '@infinite-table/infinite-react';

type Item = {
  id: number;
  name: string;
};

const data: Item[] = Array.from({ length: 20 }, (_, id) => ({
  id,
  name: `Item ${id}`,
}));

function HeaderWithPopup() {
  const { htmlElementRef, column } = useInfiniteHeaderCell<Item>();
  const portalContainer = useInfinitePortalContainer();
  const [visible, setVisible] = React.useState(false);
  const domRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (visible && domRef.current && htmlElementRef.current) {
      alignNode(domRef.current, {
        alignTo: htmlElementRef.current,
        alignPosition: [['TopRight', 'BottomRight']],
      });
    }
  });

  return (
    <div>
      <button data-name="toggle-popup" onClick={() => setVisible((v) => !v)}>
        {column.id}
      </button>
      {visible && portalContainer
        ? createPortal(
            <div
              ref={domRef}
              data-name="popup"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 150,
                height: 50,
                background: 'tomato',
              }}
            >
              popup
            </div>,
            portalContainer,
          )
        : null}
    </div>
  );
}

const columns: InfiniteTablePropColumns<Item> = {
  id: { field: 'id' },
  name: {
    field: 'name',
    defaultWidth: 300,
    renderHeader: () => <HeaderWithPopup />,
  },
};

const domProps = {
  style: {
    height: '60vh',
    margin: '40px',
  },
};

export default function DataTestPage() {
  return (
    <React.StrictMode>
      <DataSource<Item> data={data} primaryKey="id">
        <InfiniteTable<Item> domProps={domProps} columns={columns} />
      </DataSource>
    </React.StrictMode>
  );
}
