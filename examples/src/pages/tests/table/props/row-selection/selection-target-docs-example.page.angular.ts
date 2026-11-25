import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourcePropMultiRowSelectionTarget } from '@infinite-table/infinite-angular';

import { data, height80vhDomProps, type Developer } from './common';

const columns: Record<string, any> = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 80 },
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const groupBy = [{ field: 'stack' as const }];

const filterFunction = ({ data }: { data: Developer }) =>
  data.preferredLanguage === 'TypeScript';

const dataSource = () =>
  new Promise<Developer[]>((resolve) => setTimeout(() => resolve(data), 20));

const toolbarStyle = {
  padding: '10px',
  display: 'flex',
  gap: '20px',
  color: 'tomato',
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div [style]="toolbarStyle">
      <label>
        multiRowSelectionTarget:
        <select data-name="target" [value]="target()" (change)="onTargetChange($event)">
          <option value="all">all</option>
          <option value="visible">visible</option>
        </select>
      </label>
      <label>
        <input
          data-name="only-typescript"
          type="checkbox"
          [checked]="filtered()"
          (change)="onFilteredChange($event)"
        />
        Only show TypeScript developers
      </label>
    </div>
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      selectionMode="multi-row"
      [multiRowSelectionTarget]="target()"
      [groupBy]="groupBy"
      [filterFunction]="filtered() ? filterFunction : undefined"
    >
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class SelectionTargetDocsExamplePage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly filterFunction = filterFunction;
  protected readonly domProps = height80vhDomProps;
  protected readonly toolbarStyle = toolbarStyle;

  protected readonly target =
    signal<DataSourcePropMultiRowSelectionTarget>('visible');
  protected readonly filtered = signal(true);

  protected onTargetChange(event: Event) {
    this.target.set(
      (event.target as HTMLSelectElement)
        .value as DataSourcePropMultiRowSelectionTarget,
    );
  }

  protected onFilteredChange(event: Event) {
    this.filtered.set((event.target as HTMLInputElement).checked);
  }
}
