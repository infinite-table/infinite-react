import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourcePropGroupBy } from '@infinite-table/infinite-angular';

(globalThis as any).dataParamsCalls = [];


const dataSource = ({
  groupBy,
  groupKeys = [],
  multiRowSelectionTarget,
}: {
  groupBy?: { field?: any }[];
  groupKeys?: any[];
  multiRowSelectionTarget?: 'all' | 'visible';
}) => {
  (globalThis as any).dataParamsCalls.push({
    groupKeys,
    multiRowSelectionTarget,
  });
  const args = [
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field })))
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql?` + args,
  ).then((r) => r.json());
};

const columns: Record<string, any> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const groupBy: DataSourcePropGroupBy<any> = [
  { field: 'stack' },
  { field: 'preferredLanguage' },
];

const domProps = {
  style: { height: '80vh' },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="dataSource"
      [groupBy]="groupBy"
      [lazyLoad]="true"
      selectionMode="multi-row"
      [useGroupKeysForMultiRowSelection]="true"
      [multiRowSelectionTarget]="target()"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        groupRenderStrategy="single-column"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>
  `,
})
export default class SelectionTargetLazyPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly domProps = domProps;

  protected readonly target = signal<'all' | 'visible'>('visible');

  constructor() {
    (globalThis as any).setTarget = (value: 'all' | 'visible') => {
      this.target.set(value);
    };
  }
}
