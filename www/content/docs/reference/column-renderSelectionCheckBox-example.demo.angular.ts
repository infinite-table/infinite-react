import { Component, TemplateRef, viewChild } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
  renderTemplate,
} from '@infinite-table/infinite-angular';
import type {
  DataSourceProps,
  InfiniteTablePropColumns,
  InfiniteTableProps,
} from '@infinite-table/infinite-angular';

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
    defaultHiddenWhenGroupedBy: '*',
  },
  stack: {
    field: 'stack',
    renderGroupValue: ({ value }) => `Stack: ${value || ''}`,
  },
  age: { field: 'age' },
  id: { field: 'id' },
  preferredLanguage: {
    field: 'preferredLanguage',
    renderGroupValue: ({ value }) => `Lang: ${value || ''}`,
  },
  canDesign: {
    field: 'canDesign',
    renderGroupValue: ({ value }) => `Can design: ${value || ''}`,
  },
};

const defaultGroupBy: DataSourceProps<Developer>['groupBy'] = [
  {
    field: 'canDesign',
  },
  {
    field: 'stack',
  },
  {
    field: 'preferredLanguage',
  },
];

const domProps = {
  style: {
    flex: 1,
    minHeight: 500,
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable, InfiniteRender],
  template: `
    <infinite-data-source
      [data]="dataSource"
      [groupBy]="defaultGroupBy"
      selectionMode="multi-row"
      primaryKey="id"
    >
      <infinite-table
        debugId="column-renderSelectionCheckBox-example"
        [columns]="columns"
        [domProps]="domProps"
        [groupColumn]="groupColumn"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>

    <!-- #highlight the default checkbox, decorated -->
    <ng-template #selection let-selectionCheckBox="selectionCheckBox">
      <b>[<ng-container [infiniteRender]="selectionCheckBox" />]</b>
    </ng-template>
    <!-- #endhighlight -->
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly defaultGroupBy = defaultGroupBy;
  protected readonly domProps = domProps;

  private readonly selectionTemplate =
    viewChild.required<TemplateRef<unknown>>('selection');

  protected readonly groupColumn: InfiniteTableProps<Developer>['groupColumn'] =
    {
      field: 'firstName',
      renderSelectionCheckBox: ({ renderBag }) => {
        // render the default value and decorate it
        return renderTemplate(this.selectionTemplate(), {
          selectionCheckBox: renderBag.selectionCheckBox,
        });
      },
      defaultWidth: 300,
    };
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
