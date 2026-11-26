import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourcePropGroupBy } from '@infinite-table/infinite-angular';

import { data, height80vhDomProps, type Developer } from './common';

const columns: Record<string, any> = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 80 },
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'stack' }];

const filterFunction = ({ data }: { data: Developer }) =>
  data.preferredLanguage !== 'JavaScript';

type Config = {
  target: 'all' | 'visible';
  grouped: boolean;
  useGroupKeys: boolean;
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      selectionMode="multi-row"
      [multiRowSelectionTarget]="config().target"
      [useGroupKeysForMultiRowSelection]="config().useGroupKeys"
      [groupBy]="config().grouped ? groupBy : undefined"
      [filterFunction]="filtered() ? filterFunction : undefined"
    >
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class SelectionTargetPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly filterFunction = filterFunction;
  protected readonly domProps = height80vhDomProps;

  protected readonly config = signal<Config>({
    target: 'all',
    grouped: false,
    useGroupKeys: false,
  });
  protected readonly filtered = signal(false);

  constructor() {
    (globalThis as any).setConfig = (value: Config) => {
      this.config.set(value);
    };
    (globalThis as any).setFiltered = (value: boolean) => {
      this.filtered.set(value);
    };
  }
}
