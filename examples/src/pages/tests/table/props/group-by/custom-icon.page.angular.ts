import { Component, TemplateRef, viewChild } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
  MenuIcon,
  renderComponent,
} from '@infinite-table/infinite-angular';

import { data } from './people';

const groupBy = [
  {
    field: 'department' as const,
  },
  { field: 'team' as const, column: { field: 'team' as const } },
];

const slicedData = data.slice(0, 5);

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable, InfiniteRender],
  template: `
    <infinite-data-source
      [data]="slicedData"
      primaryKey="id"
      [groupBy]="groupBy"
    >
      <infinite-table
        [domProps]="domProps"
        [defaultActiveRowIndex]="0"
        [columnDefaultWidth]="250"
        [columns]="columns"
      />
    </infinite-data-source>

    <ng-template #testIcon let-renderBag="renderBag">
      <div
        data-name="test-icon"
        style="display: flex; flex-direction: row; color: red"
      >
        x<ng-container [infiniteRender]="renderBag.menuIcon" />
      </div>
    </ng-template>
  `,
})
export default class GroupByCustomIconPage {
  protected readonly slicedData = slicedData;
  protected readonly groupBy = groupBy;
  protected readonly domProps = domProps;

  private readonly testIcon =
    viewChild.required<TemplateRef<unknown>>('testIcon');

  protected readonly columns: Record<string, any> = {
    name: {
      field: 'name',
      header: 'NAME - TEST USES THIS COLUMN',
      renderMenuIcon: () => this.testIcon(),
    },
    department: {
      field: 'department',
      style: {
        color: 'red',
      },
      renderMenuIcon: ({ renderBag }: { renderBag: any }) => {
        return renderBag.menuIcon;
      },
    },

    team: {
      field: 'team',
      renderMenuIcon: ({ renderBag }: { renderBag: any }) => {
        return renderComponent(MenuIcon, { inputs: renderBag.menuIconProps });
      },
    },
  };
}
