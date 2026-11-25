import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns } from '../columns';
import { rowData } from '../rowData';

const getColumnGroups = () => {
  const columnGroups: Record<string, any> = {
    'contact info': { header: 'Contact info' },
    street: { header: 'street', columnGroup: 'address' },
    location: { header: 'location', columnGroup: 'address' },
    address: { header: 'Address' },
  };

  return columnGroups;
};

const collapsedColumnGroups = new Map<string[], string>();

(globalThis as any).collapsedColumnGroups = collapsedColumnGroups;

const columnGroups = signal(getColumnGroups());

(globalThis as any).columnGroups = columnGroups();
(globalThis as any).setColumnGroups = (updater: any) => {
  columnGroups.set(
    typeof updater === 'function' ? updater(columnGroups()) : updater,
  );
  (globalThis as any).columnGroups = columnGroups();
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const columnPinning = {
  id: true as const,
  streetNo: true as const,
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="rowData">
      <infinite-table
        [domProps]="domProps"
        [columnPinning]="columnPinning"
        [columnGroups]="columnGroups()"
        [pinnedStartMaxWidth]="300"
        [columnDefaultWidth]="240"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class UncontrolledColumnGroupsPage {
  protected readonly rowData = rowData;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly columnPinning = columnPinning;
  protected readonly columnGroups = columnGroups;
}
