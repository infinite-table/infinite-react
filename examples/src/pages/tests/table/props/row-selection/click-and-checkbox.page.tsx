import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTableApi,
  InfiniteTablePropColumns,
  InfiniteTablePropMultiRowSelectionWith,
  DataSourcePropRowSelection_MultiRow,
} from '@infinite-table/infinite-react';
import { useState } from 'react';

type Developer = {
  id: number;
  name: string;
  language: string;
  level: string;
};

// grouped by language, the rows are:
// TypeScript (1, 2, 3), Go (4, 5), Rust (6, 7, 8)
// and grouped by language and level:
// TypeScript (junior: 1, senior: 2, 3), Go (junior: 4, senior: 5),
// Rust (junior: 6, 7, senior: 8)
const data: Developer[] = [
  { id: 1, name: 'TS 1', language: 'TypeScript', level: 'junior' },
  { id: 2, name: 'TS 2', language: 'TypeScript', level: 'senior' },
  { id: 3, name: 'TS 3', language: 'TypeScript', level: 'senior' },
  { id: 4, name: 'Go 1', language: 'Go', level: 'junior' },
  { id: 5, name: 'Go 2', language: 'Go', level: 'senior' },
  { id: 6, name: 'Rust 1', language: 'Rust', level: 'junior' },
  { id: 7, name: 'Rust 2', language: 'Rust', level: 'junior' },
  { id: 8, name: 'Rust 3', language: 'Rust', level: 'senior' },
];

const domProps = {
  style: {
    height: '80vh',
  },
};

const groupBy = [{ field: 'language' as const }];
const nestedGroupBy = [
  { field: 'language' as const },
  { field: 'level' as const },
];

export default function RowSelectionClickAndCheckbox() {
  const [grouped, setGrouped] = useState<false | 'language' | 'nested'>(false);
  const [checkboxColumn, setCheckboxColumn] = useState(false);
  const [groupColumnCheckbox, setGroupColumnCheckbox] = useState(false);
  const [selectWith, setSelectWith] =
    useState<InfiniteTablePropMultiRowSelectionWith>('checkbox');
  const [api, setApi] = useState<InfiniteTableApi<Developer> | null>(null);
  const [rowSelection, setRowSelection] =
    useState<DataSourcePropRowSelection_MultiRow>({
      selectedRows: [],
      defaultSelection: false,
    });
  const columns = React.useMemo<InfiniteTablePropColumns<Developer>>(() => {
    const columns: InfiniteTablePropColumns<Developer> = {};
    if (checkboxColumn) {
      columns.selection = {
        renderValue: () => null,
        renderSelectionCheckBox: true,
        defaultWidth: 60,
      };
    }
    columns.name = { field: 'name' };
    columns.language = { field: 'language' };
    return columns;
  }, [checkboxColumn]);

  const groupColumn = React.useMemo(
    () => ({ renderSelectionCheckBox: groupColumnCheckbox }),
    [groupColumnCheckbox],
  );

  const selectedIds = api
    ? api.rowSelectionApi
        .getSelectedPrimaryKeys(rowSelection)
        .slice()
        .sort((a, b) => (a as number) - (b as number))
    : [];

  const button = (name: string, onClick: VoidFunction) => (
    <button data-name={name} onClick={onClick}>
      {name}
    </button>
  );

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {button('group', () => setGrouped('language'))}
        {button('group-nested', () => setGrouped('nested'))}
        {button('ungroup', () => setGrouped(false))}
        {button('checkbox-column-on', () => setCheckboxColumn(true))}
        {button('checkbox-column-off', () => setCheckboxColumn(false))}
        {button('group-column-checkbox-on', () => setGroupColumnCheckbox(true))}
        {button('group-column-checkbox-off', () =>
          setGroupColumnCheckbox(false),
        )}
        {button('select-with-click', () => setSelectWith('click'))}
        {button('select-with-checkbox', () => setSelectWith('checkbox'))}
        {button('collapse-go', () => api?.collapseGroupRow(['Go']))}
        {button('collapse-ts-senior', () =>
          api?.collapseGroupRow(['TypeScript', 'senior']),
        )}
        {button('clear-selection', () =>
          setRowSelection({ selectedRows: [], defaultSelection: false }),
        )}
      </div>
      <pre data-name="selection-config">
        {JSON.stringify({
          grouped,
          checkboxColumn,
          groupColumnCheckbox,
          selectWith,
        })}
      </pre>
      <pre data-name="selected-ids">{JSON.stringify(selectedIds)}</pre>
      <DataSource<Developer>
        primaryKey="id"
        data={data}
        groupBy={
          grouped === 'nested' ? nestedGroupBy : grouped ? groupBy : []
        }
        selectionMode="multi-row"
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          groupColumn={groupColumn}
          groupRenderStrategy="single-column"
          multiRowSelectionWith={selectWith}
          onReady={({ api }) => setApi(api)}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}
