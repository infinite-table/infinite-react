import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  viewChild,
} from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  type InfiniteTablePropColumns,
  type InfiniteTableRowInfo,
} from '@infinite-table/infinite-angular';

type City = {
  id: number;
  name: string;
  country: string;
};

const data: City[] = [
  { id: 0, name: 'Paris', country: 'France' },
  { id: 1, name: 'Lyon', country: 'France' },
  { id: 2, name: 'Rome', country: 'Italy' },
  { id: 3, name: 'Milan', country: 'Italy' },
  { id: 4, name: 'Madrid', country: 'Spain' },
  { id: 5, name: 'Seville', country: 'Spain' },
];

const columns: InfiniteTablePropColumns<City> = {
  id: { field: 'id', renderRowDetailIcon: true },
  name: { field: 'name' },
  country: { field: 'country' },
};

@Component({
  selector: 'test-page',
  imports: [DataSource, InfiniteTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #detail let-rowInfo>
      <div [attr.data-name]="'detail-' + rowInfo.id" style="height: 100%">
        <button (click)="onDetailClick(rowInfo)">
          Detail of {{ rowInfo.data?.name }}
        </button>
      </div>
    </ng-template>

    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [rowHeight]="40"
        [rowDetailHeight]="200"
        [defaultRowDetailState]="defaultRowDetailState"
        [rowDetailRenderer]="renderDetail"
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class DetailRowHeightPage {
  protected readonly data = data;
  protected readonly columns = columns;

  protected readonly defaultRowDetailState = {
    expandedRows: [1],
    collapsedRows: true as const,
  };

  protected readonly domProps = {
    style: {
      height: '80vh',
    },
  };

  private readonly detailTemplate =
    viewChild.required<TemplateRef<unknown>>('detail');

  protected readonly renderDetail = () => this.detailTemplate();

  protected onDetailClick(rowInfo: InfiniteTableRowInfo<City>) {
    (globalThis as any).detailClicks = [
      ...((globalThis as any).detailClicks || []),
      rowInfo.id,
    ];
  }
}
