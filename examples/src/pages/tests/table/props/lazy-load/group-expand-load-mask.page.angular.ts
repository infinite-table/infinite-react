import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  DataSourceGroupBy,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = { id: number; firstName: string; country: string };

const developers: Developer[] = [
  { id: 1, firstName: 'Ana', country: 'Australia' },
  { id: 2, firstName: 'John', country: 'Australia' },
  { id: 3, firstName: 'Emma', country: 'Brazil' },
];

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
};

const groupBy: DataSourceGroupBy<Developer>[] = [{ field: 'country' }];

const domProps = {
  style: { height: '80vh' },
};

const globals = globalThis as any;

// the children of a group wait until the test releases them
const pending: (() => void)[] = [];
globals.releaseGroupLoads = () =>
  pending.splice(0).forEach((release) => release());

const data: DataSourceData<Developer> = async ({ groupKeys = [] }) => {
  if (!groupKeys.length) {
    const countries = [...new Set(developers.map((d) => d.country))];
    return {
      data: countries.map((country) => ({
        keys: [country],
        data: { country },
        totalChildrenCount: developers.filter((d) => d.country === country)
          .length,
      })),
      totalCount: countries.length,
    } as any;
  }

  await new Promise<void>((resolve) => pending.push(resolve));
  const rows = developers.filter((d) => d.country === groupKeys[0]);
  return { data: rows, totalCount: rows.length };
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [groupBy]="groupBy"
      [lazyLoad]="true"
    >
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class GroupExpandLoadMaskPage {
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly domProps = domProps;
  protected readonly data = data;
}
