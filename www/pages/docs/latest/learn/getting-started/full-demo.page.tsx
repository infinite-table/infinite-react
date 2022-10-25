import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  InfiniteTablePropColumnTypes,
  DataSourcePropRowSelection_MultiRow,
} from '@infinite-table/infinite-react';
import type {
  InfiniteTableColumn,
  InfiniteTableColumnRenderValueParam,
  DataSourcePropAggregationReducers,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';
import { components } from '@infinite-table/infinite-react';
const { CheckBox } = components;

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

const avgReducer = {
  initialValue: 0,
  reducer: (acc: number, sum: number) => acc + sum,
  done: (value: number, arr: any[]) =>
    arr.length ? Math.floor(value / arr.length) : 0,
};
const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    field: 'salary',

    ...avgReducer,
  },
  age: {
    field: 'age',
    ...avgReducer,
  },
  currency: {
    field: 'currency',
    initialValue: new Set<string>(),
    reducer: (acc: Set<string>, value: string) => {
      acc.add(value);
      return acc;
    },
    done: (value: Set<string>) => {
      return value.size > 1 ? 'Mixed' : value.values().next().value;
    },
  },
  canDesign: {
    field: 'canDesign',

    initialValue: false,
    reducer: (acc: boolean | null, value: 'yes' | 'no') => {
      if (acc === null) {
        return acc;
      }
      if (acc === false && value === 'yes') {
        return null;
      }
      if (acc === true && value === 'no') {
        return null;
      }
      return acc;
    },
  },
};

const flags = {
  'United States': '🇺🇸',
  Canada: '🇨🇦',
  France: '🇫🇷',
  Germany: '🇩🇪',
  'United Kingdom': '🇬🇧',
  'South Africa': '🇿🇦',
  'New Zealand': '🇳🇿',
  Sweden: '🇸🇪',
  China: '🇨🇳',
  Brazil: '🇧🇷',
  Turkey: '🇹🇷',
  Italy: '🇮🇹',
  India: '🇮🇳',
  Indonesia: '🇮🇩',
  Japan: '🇯🇵',
  Argentina: '🇦🇷',
  'Saudi Arabia': '🇸🇦',
  Mexico: '🇲🇽',
  'United Arab Emirates': '🇦🇪',
};
function getColumns(): Record<string, InfiniteTableColumn<Developer>> {
  return {
    age: {
      field: 'age',
      header: 'Age',
      type: 'number',
      defaultWidth: 80,
      renderValue: ({ value }) => value,
    },
    salary: {
      header: 'Compensation',
      field: 'salary',
      type: 'number',
      defaultWidth: 170,
    },
    currency: { field: 'currency', header: 'Currency', defaultWidth: 100 },
    preferredLanguage: {
      field: 'preferredLanguage',
      header: 'Programming Language',
    },

    canDesign: {
      defaultWidth: 135,
      field: 'canDesign',
      header: 'Design Skills',
      renderMenuIcon: false,
      renderValue: ({ value }) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CheckBox
              defaultChecked={value === null ? null : value === 'yes'}
              domProps={{
                style: {
                  marginRight: 10,
                },
              }}
            />
            {value === null ? 'Some' : value === 'yes' ? 'Yes' : 'No'}
          </div>
        );
      },
    },
    country: {
      field: 'country',
      header: 'Country',
      renderValue: ({ value }) => {
        return (
          <span>
            {(flags as any)[value] || null} {value}
          </span>
        );
      },
    },
    firstName: { field: 'firstName', header: 'First Name' },
    stack: { field: 'stack', header: 'Stack' },

    city: { field: 'city', header: 'City' },
  };
}

// → 123.456,789
const groupColumn: InfiniteTableColumn<Developer> = {
  header: 'Grouping',
  field: 'firstName',
  defaultWidth: 250,
  renderSelectionCheckBox: true,

  // in this function we have access to collapsed info
  // and grouping info about the current row - see rowInfo.groupBy
  renderValue: ({
    value,
    rowInfo,
  }: InfiniteTableColumnRenderValueParam<Developer>) => {
    if (!rowInfo.isGroupRow) {
      return value;
    }
    const groupBy = rowInfo.groupBy || [];
    const collapsed = rowInfo.collapsed;
    const groupField = groupBy[groupBy.length - 1];

    if (groupField === 'age') {
      return `🥳 ${value}${collapsed ? ' 🤷‍♂️' : ''}`;
    }

    return `${value}`;
  },
};

const defaultGroupRowsState = new GroupRowsState({
  //make all groups collapsed by default
  collapsedRows: true,
  expandedRows: [
    ['United States'],
    ['United States', 'backend'],
    ['France'],
    ['Turkey'],
  ],
});

const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  number: {
    align: 'end',
    style: () => {
      return {};
    },
    renderValue: ({ value, data, rowInfo }) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency:
          rowInfo.isGroupRow && rowInfo.data?.currency === 'Mixed'
            ? 'USD'
            : data?.currency || 'USD',
      }).format(value);
    },
  },
};

const defaultRowSelection: DataSourcePropRowSelection_MultiRow = {
  selectedRows: [['United States'], ['India'], ['France'], ['Turkey']],
  deselectedRows: [['United States', 'frontend']],
  defaultSelection: false,
};

export default function App() {
  const [{ min, max }, setMinMax] = useState({ min: 0, max: 0 });
  const columns = React.useMemo(() => {
    const cols = getColumns();

    if (cols.salary) {
      const style: InfiniteTableColumn<Developer>['style'] = ({ value }) => {
        const increase: number = Math.abs(max - min);
        const percentage = ((value - min) / increase) * 100;
        let alpha = Number((percentage / 100).toPrecision(2)) - 0.2;

        const backgroundColor = `rgba(255, 0, 0, ${alpha})`;

        return { backgroundColor };
      };
      cols.salary.render = ({ renderBag, value, rowInfo }) => {
        const increase: number = Math.abs(max - min);
        const percentage = ((value - min) / increase) * 100;
        let alpha = Number((percentage / 100).toPrecision(2)) + 0.2;

        const backgroundColor = `rgba(255, 0, 0, ${alpha})`;
        return (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor,
            }}
          >
            {renderBag.all}
          </div>
        );
      };
    }

    return cols;
  }, [min, max]);

  const groupBy: DataSourceGroupBy<Developer>[] = React.useMemo(
    () => [
      {
        field: 'country',
      },
      { field: 'stack' },
    ],
    [],
  );

  const Link = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return (
      <a
        href={href}
        style={{
          textDecoration: 'underline',
          color: '#3bff7f',
          padding: 20,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {children}
      </a>
    );
  };
  return (
    <>
      <div style={{ display: 'flex' }}>
        <Link href="/">
          <img
            src="/logo-infinite.svg"
            width={50}
            title="Infinite Logo"
            style={{ marginRight: 20 }}
          />
          Go Back Home
        </Link>

        <Link href="/docs/latest/learn/getting-started#built-for-react-from-the-ground-up">
          View source
        </Link>
      </div>
      <DataSource<Developer>
        data={dataSource}
        primaryKey="id"
        useGroupKeysForMultiRowSelection
        defaultRowSelection={defaultRowSelection}
        defaultSortInfo={{
          dir: -1,
          field: 'country',
        }}
        onDataArrayChange={(data) => {
          const min = Math.min(...data.map((data) => data.salary ?? 0));
          const max = Math.max(...data.map((data) => data.salary ?? 0));

          setMinMax({ min, max });
        }}
        defaultGroupRowsState={defaultGroupRowsState}
        aggregationReducers={aggregationReducers}
        groupBy={groupBy}
      >
        <InfiniteTable<Developer>
          groupRenderStrategy="single-column"
          defaultColumnPinning={{
            'group-by': true,
          }}
          defaultActiveRowIndex={0}
          groupColumn={groupColumn}
          licenseKey={process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY}
          columns={columns}
          columnTypes={columnTypes}
          columnDefaultWidth={150}
        />
      </DataSource>
    </>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
