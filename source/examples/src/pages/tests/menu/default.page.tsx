import * as React from 'react';

import { Menu, MenuItemDefinition } from '@infinite-table/infinite-react';

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
        '-',
        {
          key: 'age',
          label: 'Age',
        },
      ],
    },
  },
  {
    key: 'test',
    label: 'test',
    // label: 'test',
  },
];
function App() {
  return (
    <div>
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
      />

      <hr />
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
      <div style={{ height: '150vh', width: 20, background: 'magenta' }}></div>
    </div>
  );
}

export default App;
