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
  {
    key: 'actions',
    label: 'actions',
    menu: {
      items: [
        {
          key: 'say hello',
          label: 'say hello',
        },
        {
          key: 'welcome',
          label: 'welcome',
        },
        {
          key: 'greetings',
          label: 'greetings',
        },
        {
          key: 'hello',
          label: 'hello',
        },
        {
          key: 'hi',
          label: 'hi',
        },
        {
          key: 'salut',
          label: 'salut',
        },
        {
          key: 'aurevoir',
          label: 'aurevoir',
        },
        {
          key: 'abientot',
          label: 'abientot',
        },
      ],
    },
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
  {
    key: 'commands',
    label: 'Commands',
    menu: {
      items: [
        {
          key: 'Export',
          label: 'Export',
          menu: {
            items: [
              {
                key: 'pdf',
                label: 'Export as PDF',
              },
              {
                key: 'excel',
                label: 'Export as Excel',
              },
              {
                key: 'csv',
                label: 'Export as CSV',
              },
              {
                key: 'json',
                label: 'Export as JSON',
              },
            ],
          },
        },
        {
          key: 'Save',
          label: 'Save',
          menu: {
            items: [
              {
                key: 'save',
                label: 'Save',
              },
              {
                key: 'save as',
                label: 'Save as',
                menu: {
                  items: [
                    {
                      key: 'save as pdf',
                      label: 'Save as PDF',
                    },
                    {
                      key: 'save as excel',
                      label: 'Save as Excel',
                    },
                    {
                      key: 'save as csv',
                      label: 'Save as CSV',
                    },
                    {
                      key: 'save as json',
                      label: 'Save as JSON',
                    },
                  ],
                },
              },
              {
                key: 'save all',
                label: 'Save all',
              },
            ],
          },
        },
      ],
    },
  },
];

function App() {
  const { portal, showOverlay } = useOverlay({
    portalContainer: '#portal',
  });

  const onContextMenu = (event: React.MouseEvent) => {
    const { pageX, pageY } = event;

    event.preventDefault();

    showOverlay(
      <Menu
        id={'test'}
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
        alignTo: {
          top: pageY,
          left: pageX,
        },
        alignPosition: [
          ['TopRight', 'TopLeft'],
          ['BottomRight', 'TopLeft'],
          ['BottomRight', 'BottomLeft'],
          ['TopLeft', 'BottomLeft'],
          ['BottomLeft', 'BottomLeft'],
        ],
      },
    );
  };
  return (
    <>
      <div onContextMenu={onContextMenu} data-context-menu>
        <Menu
          portalContainer={'#portal'}
          onAction={(key, x) => {
            console.log(key, x, 'menu');
          }}
          items={items}
          style={{
            border: '3px solid magenta',
            margin: 10,
            marginLeft: '70vw',
          }}
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
        Portal: Portal Done
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
        <div style={{ height: '150vh', width: 20, background: 'gray' }}></div>
        {portal}
      </div>

      <div
        id="portal"
        style={{
          position: 'fixed',
          width: 0,
          height: 0,
          zIndex: 1000,
        }}
      ></div>
    </>
  );
}

export default App;
