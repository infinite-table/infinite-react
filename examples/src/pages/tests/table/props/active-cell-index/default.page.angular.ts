import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns, developers1kDataSource } from './common';

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div>
      <input />
      <div>
        <input
          type="color"
          (change)="onColorChange($event)"
          [value]="defaultColor()"
        />
      </div>

      <infinite-data-source primaryKey="id" [data]="developers1kDataSource">
        <infinite-table [domProps]="domProps()" [columns]="columns" />
      </infinite-data-source>
      <input />
    </div>
  `,
})
export default class ActiveCellIndexDefaultPage {
  protected readonly developers1kDataSource = developers1kDataSource;
  protected readonly columns = columns;

  protected readonly color = signal({
    r: 77,
    g: 0,
    b: 215,
  });

  protected readonly defaultColor = computed(() => {
    const color = this.color();
    return `#${color.r.toString(16)}${color.g
      .toString(16)
      .padEnd(2, '0')}${color.b.toString(16)}`;
  });

  protected readonly domProps = computed(() => {
    const color = this.color();
    return {
      style: {
        height: '90vh',
        '--infinite-active-cell-border-color--r': color.r,
        '--infinite-active-cell-border-color--g': color.g,
        '--infinite-active-cell-border-color--b': color.b,
      },
    };
  });

  protected onColorChange(event: Event) {
    const colorValue = (event.target as HTMLInputElement).value;

    const r = parseInt(colorValue.substr(1, 2), 16);
    const g = parseInt(colorValue.substr(3, 2), 16);
    const b = parseInt(colorValue.substr(5, 2), 16);

    this.color.set({ r, g, b });
  }
}
