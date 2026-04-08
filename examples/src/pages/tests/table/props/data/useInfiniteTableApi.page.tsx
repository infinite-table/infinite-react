import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceData,
  useInfiniteColumnCell,
  InfiniteTablePropGetCellContextMenuItems,
  useInfiniteTableApi,
  useInfiniteColumnApi,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { createContext } from 'react';

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

const developers: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',
    city: 'Unnao',
    age: 40,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
  },
  {
    id: 1,
    firstName: 'Axel',
    lastName: 'Runolfsson',
    country: 'Mexico',

    city: 'Cuitlahuac',

    age: 20,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'no',
    salary: 100000,
    hobby: 'sports',
  },
  {
    id: 2,
    firstName: 'Gonzalo',
    lastName: 'McGlynn',
    country: 'United Arab Emirates',
    city: 'Fujairah',
    age: 60,
    currency: 'JPY',
    preferredLanguage: 'Go',
    stack: 'frontend',
    canDesign: 'yes',
    salary: 120000,
    hobby: 'photography',
  },
];

const dataSource: DataSourceData<Developer> = () => {
  return developers;
};

const IdentifierCell = () => {
  const { value } = useInfiniteColumnCell<Developer>();
  const api = useInfiniteTableApi();

  const { setClickedId } = React.useContext(AppContext);
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={ref}>
      ID: <b>{value}</b>
      <button
        onClick={() => {
          const id = api
            .getColumnApi('identifier')
            ?.getCellValueByPrimaryKey(value);
          setClickedId(id);
        }}
      >
        click to show context menu
      </button>
    </div>
  );
};

const FirstNameCell = () => {
  const { value, data } = useInfiniteColumnCell<Developer>();
  const columnApi = useInfiniteColumnApi('firstName');
  const { setClickedFirstName } = React.useContext(AppContext);
  return (
    <div>
      <b>{value}</b>
      <button
        onClick={() => {
          const firstName = columnApi?.getCellValueByPrimaryKey(data!.id);
          setClickedFirstName(firstName);
        }}
      >
        click me
      </button>
    </div>
  );
};

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  identifier: {
    field: 'id',
    render: () => <IdentifierCell />,
  },
  firstName: {
    // valueFormatter: ({ value }) => `Name: ${value}`,
    render: () => <FirstNameCell />,
    field: 'firstName',
    name: 'First Name',
  },
  city: { field: 'city' },
  stack: { field: 'stack' },

  fullName: {
    name: 'Full name',
    render: ({ data }) => {
      return (
        <>
          {data?.firstName} - {data?.lastName}
        </>
      );
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  country: {
    field: 'country',
  },
};
const domProps: React.HTMLAttributes<HTMLDivElement> = {
  style: {
    margin: '5px',

    minHeight: '500px',
  },
};
const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<
  Developer
> = ({ column, value }) => {
  if (column.id === 'identifier') {
    return [
      {
        label: `Hello ${value}`,
        key: 'hello',
      },
    ];
  }

  return [
    {
      label: `hi ${value}`,
      key: 'hi',
    },
    {
      label: `hi ${value} - item 2`,
      key: 'hi2',
    },
  ];
};

const AppContext = createContext<{
  clickedId: number | null;
  setClickedId: (id: number | null) => void;
  clickedFirstName: string | null;
  setClickedFirstName: (firstName: string | null) => void;
}>({
  clickedId: null,
  setClickedId: () => {},
  clickedFirstName: null,
  setClickedFirstName: () => {},
});

export default function () {
  const [clickedId, setClickedId] = React.useState<number | null>(null);
  const [clickedFirstName, setClickedFirstName] = React.useState<string | null>(
    null,
  );
  return (
    <>
      <React.StrictMode>
        <AppContext.Provider
          value={{
            clickedId,
            setClickedId,
            clickedFirstName,
            setClickedFirstName,
          }}
        >
          <div data-testid="clicked-id">clicked id: {clickedId}</div>
          <div data-testid="clicked-firstName">
            clicked firstName: {clickedFirstName}
          </div>
          <DataSource<Developer> data={dataSource} primaryKey="id">
            <InfiniteTable<Developer>
              domProps={domProps}
              columnDefaultWidth={150}
              columns={columns}
              getCellContextMenuItems={getCellContextMenuItems}
            />
          </DataSource>
        </AppContext.Provider>
      </React.StrictMode>
    </>
  );
}
