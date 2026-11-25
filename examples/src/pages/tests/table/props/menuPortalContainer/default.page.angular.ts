import { Component, ElementRef, viewChild } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';



import type {
  InfiniteTablePropColumns,
  InfiniteTablePropGetCellContextMenuItems,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'John', age: 20 },
  { id: 2, firstName: 'Marry', age: 25 },
];

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
  age: { field: 'age', type: 'number' },
};

const extraItems = Array.from({ length: 8 }, (_, index) => ({
  key: `extra-${index}`,
  label: `Extra ${index}`,
}));

const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<
  Developer
> = () => extraItems;


const domProps = { style: { width: '400px', height: '120px' } };

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
  <div
    data-name="constrain"
    #constrainEl
    style="position: relative; width: 800px; height: 600px"
  >
    <div data-name="clip" style="width: 400px; height: 120px; overflow: hidden">
      <infinite-data-source [data]="data" primaryKey="id">
        <infinite-table
          [domProps]="domProps"
          [columns]="columns"
          [columnDefaultWidth]="150"
          [getCellContextMenuItems]="getCellContextMenuItems"
          [menuPortalContainer]="menuPortalContainer"
          [menuConstrainTo]="menuConstrainTo"
        />
      </infinite-data-source>
    </div>
    <div data-name="portal" #portalEl></div>
  </div>
  `,
})
export default class DefaultPage {
  protected readonly columns = columns;
  protected readonly data = data;
  protected readonly domProps = domProps;
  protected readonly getCellContextMenuItems = getCellContextMenuItems;
  private readonly portalEl = viewChild<ElementRef<HTMLElement>>('portalEl');
  private readonly constrainEl = viewChild<ElementRef<HTMLElement>>('constrainEl');
  protected readonly menuPortalContainer = () =>
    this.portalEl()?.nativeElement ?? null;
  protected readonly menuConstrainTo = () =>
    this.constrainEl()?.nativeElement ?? null;
}
