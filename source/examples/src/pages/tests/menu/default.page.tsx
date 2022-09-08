import * as React from 'react';

import {
  Menu,
  MenuItemDefinition,
  useOverlay,
} from '@infinite-table/infinite-react';

const items: MenuItemDefinition[] = [
  {
    key: 'copy',
    label: 'Copy',
    icon: 'copy me',
    shortcut: 'cmd + k',
  },
  {
    key: 'cut',
    label: 'Cut',
    icon: 'Cut me',
    shortcut: 'cmd + c',
    disabled: true,
  },
  '-',
  {
    key: 'columns',
    label: <b>Columns</b>,
    icon: 'columns icon',
    shortcut: 'click',

    menu: {
      items: [
        {
          key: 'col1',
          label: 'column 1',
        },
        '-',
        {
          key: 'age',
          label: 'Age',
        },
        {
          key: 'col2',
          label: 'column 2',
        },
        {
          key: 'translate',
          label: 'Translate',
          menu: {
            items: [
              {
                key: 'en',
                label: 'Into english',
              },

              {
                key: 'es',
                label: 'Into spanish',
              },
              {
                key: 'de',
                label: 'Into detsch',
              },
              {
                key: 'fr',
                label: 'Into french',
              },
            ],
          },
        },
      ],
    },
  },
  {
    key: 'test',
    label: 'test',
    onAction(key, x) {
      console.log(key, x);
    },
    // label: 'test',
  },
];

function App() {
  const { portal, showOverlay } = useOverlay({});

  const onContextMenu = (event: React.MouseEvent) => {
    const { pageX, pageY } = event;
    console.log({ pageX, pageY });

    event.preventDefault();

    showOverlay(
      <Menu
        items={items}
        style={{ border: '1px solid gray', margin: 10 }}
        columns={[
          {
            name: 'label',
            flex: 2,
          },
          {
            name: 'icon',
            flex: 1,
          },
          { name: 'shortcut' },
        ]}
      />,
      {
        id: 'contextMenu',
        alignTo: {
          top: pageY,
          left: pageX,
        },
        constrainTo: true,
        alignPosition: [
          ['TopLeft', 'TopLeft'],
          ['BottomRight', 'TopLeft'],
        ],
      },
    );
  };
  return (
    <>
      <div id="portal" style={{ position: 'fixed' }} />
      <div onContextMenu={onContextMenu}>
        <Menu
          onAction={(key, x) => {
            console.log(key, x, 'menu');
          }}
          items={items}
          style={{ border: '1px solid gray', margin: 10, marginLeft: '70vw' }}
          columns={[
            {
              name: 'label',
              flex: 2,
            },
            {
              name: 'icon',
              flex: 1,
            },
            { name: 'shortcut' },
          ]}
        />
        <hr />
        Portal:
        {portal}
        Portal Done
        {/* 
      <Menu
        style={{ width: '30vw', border: '1px solid gray', margin: 10 }}
        columns={[
          { name: 'label', style: { textAlign: 'center' } },
          {
            name: 'description',
            style: { color: 'red' },
            render: ({ value, domProps }) => {
              const [x, setx] = React.useState(0);

              return (
                //@ts-ignore
                <div {...domProps}>
                  {value} {x}{' '}
                  <button
                    onClick={() => {
                      setx((x) => x + 1);
                    }}
                  >
                    inc
                  </button>
                </div>
              );
            },
          },
        ]}
      >
        <MenuItem key="copy" label="Copy">
          <b>Copy me</b>
        </MenuItem>
        <hr />
        <MenuItem key="y">Paste</MenuItem>
        <MenuItem key="yz">Copy paste</MenuItem>
      </Menu> */}
        <div
          style={{ height: '150vh', width: 20, background: 'magenta' }}
        ></div>
      </div>
    </>
  );
}

export default App;
