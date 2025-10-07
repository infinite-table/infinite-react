import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  DataSourceApi,
  InfiniteTableApi,
  DataSourcePropCellSelection_MultiCell,
  InfiniteTableRowInfo,
  debounce,
} from '@infinite-table/infinite-react';

import { AgChartProps, AgCharts as AgChartsReact } from 'ag-charts-react';

import * as React from 'react';
import { useState } from 'react';

type SelectProps = {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
};
function Select(props: SelectProps) {
  return (
    <select
      value={props.value}
      onChange={(e) => {
        props.onChange(e.target.value);
      }}
    >
      {props.options.map((opt) => {
        return (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        );
      })}
    </select>
  );
}

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

type CellSelectionValues = {
  columnIds: string[];
  positions: (CellSelectionPosition | string)[][];
};

type CellSelectionPosition = {
  columnId: string;
  value: string | number;
};

const dataSource = () => {
  return fetch(
    'https://infinite-table.com/.netlify/functions/json-server' +
      '/developers1k',
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 60 },
  firstName: { field: 'firstName' },
  age: { field: 'age', type: 'number' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },

  salary: { field: 'salary', type: 'number' },
  currency: { field: 'currency', type: 'number' },
};

function ChartContainer({ children }: { children?: React.ReactNode }) {
  return (
    <div
      style={{
        height: '20vh',
        minHeight: 300,
        display: 'flex',
        flexFlow: 'column',
      }}
    >
      {children}
    </div>
  );
}

function useChartColumns() {
  const visibleColumns = Object.keys(columns);
  const [selectedColumns, setSelectedColumns] = useState<[string, string]>([
    'firstName',
    'age',
  ]);

  const options = [
    {
      label: 'Select...',
      value: '',
    },
    ...visibleColumns.map((colId) => {
      return {
        label: colId,
        value: colId,
      };
    }),
  ];
  const columnSelector = (
    <div>
      <h3>Select chart columns</h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 200px',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'start',
        }}
      >
        <label>X Axis Column:</label>
        <Select
          data-name="x-axis"
          options={options}
          value={selectedColumns[0]}
          onChange={(value: string) => {
            setSelectedColumns([value, selectedColumns[1]]);
          }}
        />
        <label>Y Axis Column:</label>

        <Select
          data-name="y-axis"
          options={options}
          value={selectedColumns[1]}
          onChange={(value: string) => {
            setSelectedColumns([selectedColumns[0], value]);
          }}
        />
      </div>
    </div>
  );
  return {
    columns: selectedColumns,
    columnsReady: selectedColumns.filter(Boolean).length === 2,
    columnSelector,
  };
}
function Charts(props: { selectedValues: CellSelectionValues | null }) {
  const { columnSelector: node, columns, columnsReady } = useChartColumns();

  const selectedValues = props.selectedValues;

  if (!selectedValues || !columnsReady) {
    return (
      <>
        {node}
        <ChartContainer>
          <h3 style={{ paddingBlock: 10 }}>
            {!columnsReady
              ? 'Chart columns not selected yet...'
              : 'No cell selection'}
          </h3>
        </ChartContainer>
      </>
    );
  }

  const { columnIds, positions } = selectedValues;
  const colsSet = new Set(columnIds);

  const hasCols = colsSet.has(columns[0]) && colsSet.has(columns[1]);

  if (!hasCols) {
    return (
      <>
        {node}
        <ChartContainer>
          <div
            style={{
              paddingBlock: 10,
            }}
          >
            The current cell selection does not include <b>{columns[0]}</b> and{' '}
            <b>{columns[1]}</b>.
          </div>
        </ChartContainer>
      </>
    );
  }

  const data = positions
    .map((row) => {
      const rowData = row.reduce((acc, cell) => {
        if (typeof cell === 'object' && cell) {
          acc[cell.columnId] = cell.value;
        }
        return acc;
      }, {} as any);

      if (!rowData[columns[0]]) {
        return null;
      }

      return rowData;
    })
    .filter(Boolean);

  // Chart Options: Control & configure the chart
  const chartOptions: AgChartProps['options'] = {
    theme: 'ag-material-dark',
    data,
    // Series: Defines which chart type and data to use
    series: [{ type: 'bar', xKey: columns[0], yKey: columns[1] }],
  };
  return (
    <>
      {node}
      <ChartContainer>
        <AgChartsReact options={chartOptions} />
      </ChartContainer>
    </>
  );
}

function useSelectedValues(api: InfiniteTableApi<Developer> | undefined) {
  const [selectedValues, setSelectedValues] =
    useState<null | CellSelectionValues>(null);

  const updateSelectedValues = React.useMemo(() => {
    return debounce(
      () => {
        const selectedValues =
          api?.cellSelectionApi.mapCellSelectionPositions(
            (rowInfo: InfiniteTableRowInfo<Developer>, colId: string) => {
              const cellSelectionValue: CellSelectionPosition = {
                columnId: colId,
                value:
                  //@ts-ignore
                  rowInfo.data[columns[colId].field as keyof Developer] ?? '',
              };

              return cellSelectionValue;
            },
            '',
          ) ?? null;

        setSelectedValues(selectedValues);
      },
      { wait: 10 },
    );
  }, [api]);

  return [selectedValues, updateSelectedValues] as const;
}

const defaultCellSelection: DataSourcePropCellSelection_MultiCell = {
  defaultSelection: false,
  selectedCells: [
    [0, 'firstName'],
    [0, 'age'],
    [1, 'firstName'],
    [1, 'age'],
    [2, 'firstName'],
    [2, 'age'],
    [2, 'preferredLanguage'],
  ],
};

export default function App() {
  const [apis, setApis] = useState<{
    dataSourceApi: DataSourceApi<Developer>;
    api: InfiniteTableApi<Developer>;
  }>();

  const [selectedValues, updateSelectedValues] = useSelectedValues(apis?.api);

  return (
    <div
      style={{
        color: 'var(--infinite-cell-color)',
        height: '100vh',
        display: 'flex',
        flexFlow: 'column',
      }}
    >
      <Charts selectedValues={selectedValues} />
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        selectionMode="multi-cell"
        defaultCellSelection={defaultCellSelection}
        onCellSelectionChange={updateSelectedValues}
        onDataArrayChange={updateSelectedValues}
      >
        <InfiniteTable<Developer>
          domProps={{
            style: {
              flex: 1,
            },
          }}
          onReady={setApis}
          columns={columns}
          columnDefaultWidth={100}
        />
      </DataSource>
    </div>
  );
}
