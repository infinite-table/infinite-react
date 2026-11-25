// Code shown on the Angular version of the "Master Detail - Collapsing and
// Expanding Rows" page: the sibling of collapsing-and-expanding-rows.snippet.tsx,
// for the regions that are not the same code in Angular. Type-checked,
// templates included, by `npm run tsc:angular`.
import { Component, TemplateRef, signal } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  type DataSourceData,
  type InfiniteTablePropColumns,
  type InfiniteTableRowInfo,
  type RowDetailStateObject,
} from '@infinite-table/infinite-angular';

type DATA_TYPE = {
  id: number;
  name: string;
  country: string;
};

declare const data: DataSourceData<DATA_TYPE>;
declare const columns: InfiniteTablePropColumns<DATA_TYPE>;
declare const masterColumns: InfiniteTablePropColumns<DATA_TYPE>;
declare function renderDetail(
  rowInfo: InfiniteTableRowInfo<DATA_TYPE>,
): TemplateRef<unknown>;

//#region specyfing-the-default-row-detail-state
const defaultRowDetailState: RowDetailStateObject = {
  collapsedRows: true,
  expandedRows: [39, 54],
};

// <infinite-table
//   [columns]="columns"
//   [defaultRowDetailState]="defaultRowDetailState" // #highlight
//   [rowDetailRenderer]="renderDetail"
// />
//#endregion

//#region passing-an-instance-of-rowdetailstate-to-the
import { RowDetailState } from '@infinite-table/infinite-angular';

const rowDetailState = new RowDetailState({
  collapsedRows: true,
  expandedRows: [2, 3, 4],
});

// <infinite-table [columns]="columns" [rowDetailState]="rowDetailState" />
//#endregion

@Component({
  selector: 'row-detail-state-snippets',
  imports: [InfiniteTable],
  template: `
    <infinite-table
      [columns]="columns"
      [defaultRowDetailState]="defaultRowDetailState"
      [rowDetailRenderer]="renderDetail"
    />

    <infinite-table [columns]="columns" [rowDetailState]="rowDetailState" />

    <!-- #region passing-an-object-literal-to-the-infinitetable -->
    <infinite-table
      [columns]="columns"
      [rowDetailState]="{
        collapsedRows: true,
        expandedRows: [2, 3, 4],
      }"
    />
    <!-- #endregion -->
  `,
})
export class RowDetailStateSnippets {
  protected readonly columns = columns;
  protected readonly renderDetail = renderDetail;
  protected readonly defaultRowDetailState = defaultRowDetailState;
  protected readonly rowDetailState = rowDetailState;
}

//#region using-the-onrowdetailstatechange-listener
@Component({
  selector: 'master-detail',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="data">
      <infinite-table
        [rowDetailState]="rowDetailState()"
        (rowDetailStateChange)="onRowDetailStateChange($event)"
        [columnMinWidth]="50"
        [columns]="masterColumns"
        [rowDetailHeight]="200"
        [rowDetailRenderer]="renderDetail"
      />
    </infinite-data-source>
  `,
})
export class MasterDetail {
  protected readonly data = data;
  protected readonly masterColumns = masterColumns;
  protected readonly renderDetail = renderDetail;

  protected readonly rowDetailState = signal<RowDetailStateObject>({
    collapsedRows: true as const,
    expandedRows: [39, 54],
  });

  protected onRowDetailStateChange(
    rowDetailStateInstance: RowDetailState | RowDetailStateObject | undefined,
  ) {
    if (rowDetailStateInstance instanceof RowDetailState) {
      this.rowDetailState.set(rowDetailStateInstance.getState()); // #highlight
    }
  }
}
//#endregion

//#region listening-to-row-detail-state-changes
@Component({
  selector: 'expand-collapse-all',
  imports: [InfiniteTable],
  template: `
    <button (click)="expandAll()">Expand All</button>
    <button (click)="collapseAll()">Collapse All</button>
    <infinite-table [columns]="columns" [rowDetailState]="rowDetailState()" />
  `,
})
export class ExpandCollapseAll {
  protected readonly columns = columns;

  protected readonly rowDetailState = signal<RowDetailStateObject>({
    collapsedRows: true,
    expandedRows: [39, 54],
  });

  protected expandAll() {
    this.rowDetailState.set({
      collapsedRows: [],
      expandedRows: true,
    });
  }

  protected collapseAll() {
    this.rowDetailState.set({
      collapsedRows: true,
      expandedRows: [],
    });
  }
}
//#endregion
