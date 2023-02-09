import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  stack: {
    field: 'stack',
    header: 'Stack',
  },
  firstName: {
    field: 'firstName',
    header: 'Name',
  },
  age: {
    field: 'age',
    header: 'Age',
  },
  hobby: {
    field: 'hobby',
    header: 'Hobby',
  },
  preferredLanguage: {
    header: 'Language',
    field: 'preferredLanguage',
  },
};

export default function App() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultEditable
          getCellContextMenuItems={({ data, column }) => {
            const columns = [
              { name: 'icon' },
              { name: 'label' },
              { name: 'description' },
            ];
            return {
              columns,
              items: [
                {
                  key: 'hello',
                  icon: '👋',
                  label: `Hello, ${data?.lastName} ${data?.firstName}`,
                  description: `This is a description for ${data?.lastName}`,
                  onClick: () => {
                    alert(`Hello, ${data?.lastName} ${data?.firstName}`);
                  },
                },
                {
                  key: 'col',
                  icon: '🙌',
                  label: `Column: ${column.header}`,
                  description: `Current clicked column: ${column.header}`,
                },
                {
                  key: 'learn',
                  icon: '📚',
                  label: `Learn`,
                  description: `Learn more about ${data?.preferredLanguage}`,
                  menu: {
                    columns,
                    items: [
                      {
                        key: 'backend',
                        label: 'Backend',
                        icon: '👨‍💻',
                        description: 'In the Backend',
                        onClick: () => {
                          alert(
                            `Learn Backend, ${data?.lastName} ${data?.firstName}`,
                          );
                        },
                      },
                      {
                        key: 'frontend',
                        label: 'Frontend',
                        icon: '👨‍💻',
                        description: 'In the Frontend',
                        onClick: () => {
                          alert(
                            `Learn Frontend, ${data?.lastName} ${data?.firstName}`,
                          );
                        },
                      },
                    ],
                  },
                },
              ],
            };
          }}
        />
      </DataSource>
    </>
  );
}
