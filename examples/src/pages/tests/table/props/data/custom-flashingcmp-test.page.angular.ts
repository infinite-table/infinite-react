import { Component, effect, signal, untracked } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
  injectColumnCell,
  injectColumnCellChildren,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  salary: number;
  monthlyBonus: number;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  reposCount: number;
};

const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    monthlyBonus: 1000,
    currency: 'USD',
    salary: 1000,
    preferredLanguage: 'JavaScript',
    stack: 'Frontend',
    canDesign: 'yes',
    age: 30,
    reposCount: 100,
  },
];

const flashBackground = 'blue';

// the cell override: its host element is the cell
@Component({
  selector: 'div[customFlashingColumnCell]',
  imports: [InfiniteRender],
  host: {
    '[style.background]': 'flash() ? flashBackground : null',
  },
  template: `<ng-container [infiniteRender]="children()" />-{{ cell().value }}`,
})
class CustomFlashingColumnCell {
  protected readonly cell = injectColumnCell<Developer>();
  protected readonly children = injectColumnCellChildren();
  protected readonly flash = signal(false);
  protected readonly flashBackground = flashBackground;

  constructor() {
    let prevValue = untracked(() => {
      const ctx = this.cell();
      return {
        columnId: ctx?.column.id,
        rowId: ctx?.rowInfo.id,
        value: ctx?.value,
      };
    });
    let flashTimeoutId: any = undefined;

    effect(() => {
      const ctx = this.cell();
      if (!ctx) {
        return;
      }
      const columnId = ctx.column.id;
      const rowId = ctx.rowInfo.id;
      const value = ctx.value;

      untracked(() => {
        const prev = prevValue;

        if (
          prev.value !== value &&
          prev.rowId === rowId &&
          prev.columnId === columnId
        ) {
          this.flash.set(true);
          if (flashTimeoutId) {
            clearTimeout(flashTimeoutId);
          }
          flashTimeoutId = setTimeout(() => {
            this.flash.set(false);
          }, 100);
        }

        prevValue = {
          columnId,
          rowId,
          value,
        };
      });
    });
  }
}

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <p>Update the monthlyBonus field to see the flashing effect</p>
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="100"
        [columnMinWidth]="50"
        [columns]="columns"
        [columnDefaultEditable]="true"
      />
    </infinite-data-source>
  `,
})
export default class CustomFlashingCmpTestPage {
  protected readonly dataSource = dataSource;
  protected readonly columns: Record<string, any> = {
    id: {
      field: 'id',
    },
    firstName: {
      field: 'firstName',
    },
    monthlyBonus: {
      field: 'monthlyBonus',
      type: 'number',
      components: {
        ColumnCell: CustomFlashingColumnCell,
      },
      defaultWidth: 200,
    },
    salary: {
      field: 'salary',
      type: 'number',
    },
    reposCount: {
      field: 'reposCount',
      type: 'number',
    },

    stack: { field: 'stack', renderMenuIcon: false },
    currency: { field: 'currency' },
  };
  protected readonly domProps = {
    style: {
      height: '100%',
    },
  };
}
