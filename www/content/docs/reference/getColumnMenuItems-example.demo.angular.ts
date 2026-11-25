import { Component, TemplateRef, viewChild } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  renderTemplate,
} from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumns,
  InfiniteTablePropGetColumnMenuItems,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const getColumnMenuItems: InfiniteTablePropGetColumnMenuItems<Developer> = (
  items,
  { column },
) => {
  if (column.id === 'firstName') {
    // you can adjust the default items for a specific column
    items.splice(0, 0, {
      key: 'firstName',
      label: 'First name menu item',
      onAction: () => {
        console.log('Hey there!');
      },
    });
  }

  items.push(
    {
      key: 'hello',
      label: 'Hello World',
      onAction: () => {
        alert('Hello World from column ' + column.id);
      },
    },
    {
      key: 'translate',
      label: 'Translate',
      menu: {
        items: [
          {
            key: 'translateToEnglish',
            label: 'English',
            onAction: () => {
              console.log('Translate to English');
            },
          },
          {
            key: 'translateToFrench',
            label: 'French',
            onAction: () => {
              console.log('Translate to French');
            },
          },
        ],
      },
    },
  );
  return items;
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="getColumnMenuItems-example"
        [columnHeaderHeight]="70"
        [columns]="columns"
        [getColumnMenuItems]="getColumnMenuItems"
      />
    </infinite-data-source>

    <!-- custom menu icon -->
    <ng-template #globe>
      <div>🌎</div>
    </ng-template>

    <!-- #highlight the header of the preferredLanguage column -->
    <ng-template #languageHeader let-columnApi="columnApi">
      Preferred Language
      <!-- stop the propagation of pointerdown, so a click on the button doesn't sort the column, and of mousedown, so the menu is not closed automatically: the button toggles it -->
      <button
        style="border: 1px solid magenta; margin: 2px"
        (pointerdown)="$event.stopPropagation()"
        (mousedown)="
          $event.stopPropagation(); columnApi.toggleContextMenu($event.target)
        "
      >
        Toggle menu
      </button>
    </ng-template>
    <!-- #endhighlight -->
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly getColumnMenuItems = getColumnMenuItems;

  private readonly globeTemplate =
    viewChild.required<TemplateRef<unknown>>('globe');
  private readonly languageHeaderTemplate =
    viewChild.required<TemplateRef<unknown>>('languageHeader');

  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    currency: {
      field: 'currency',

      // custom menu icon
      renderMenuIcon: () => this.globeTemplate(),
    },

    preferredLanguage: {
      field: 'preferredLanguage',
      defaultWidth: 350,
      header: ({ columnApi, renderLocation }) => {
        // if we're inside the column menu with all columns, return only the col name
        if (renderLocation === 'column-menu') {
          return 'Preferred Language';
        }

        // but for the real column header
        // return this custom content
        return renderTemplate(this.languageHeaderTemplate(), { columnApi });
      },

      // custom menu icon
      renderMenuIcon: () => this.globeTemplate(),
    },
    salary: {
      field: 'salary',
      // hide the menu icon
      renderMenuIcon: false,
    },
    country: {
      field: 'country',
    },
    id: { field: 'id', defaultWidth: 80, renderMenuIcon: false },
    firstName: {
      field: 'firstName',
    },
  };
}
