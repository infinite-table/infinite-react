import { Component, ElementRef, TemplateRef, viewChild } from '@angular/core';
import type { AfterViewInit } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectColumnEditor,
} from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumnTypes,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  birthDate: Date;
  dateHired: Date;
  id: number;
  firstName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  hobby: string;
  salary: number;
};

const pad = (n: number) => String(n).padStart(2, '0');

// YYYY-MM-DD, the format of a native date input
function formatDate(date: Date | null | undefined) {
  if (!date) {
    return '';
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

function parseDate(value: string) {
  if (!value) {
    return null;
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// a native date input - picking a date confirms the edit,
// Escape or leaving the editor cancels it
@Component({
  selector: 'date-editor',
  template: `
    <input
      #input
      type="date"
      style="width: 100%; height: 100%; box-sizing: border-box; background: white; color: black; padding: 3px; border: none"
      [value]="initialValue"
      (change)="onChange()"
      (keydown)="onKeydown($event)"
      (blur)="cancel()"
    />
  `,
})
class DateEditor implements AfterViewInit {
  protected readonly editor = injectColumnEditor();
  protected readonly initialValue = formatDate(this.editor.initialValue);

  private readonly input =
    viewChild.required<ElementRef<HTMLInputElement>>('input');

  // true once the user types in the input: then Enter confirms the date
  private typing = false;
  private done = false;

  ngAfterViewInit() {
    const input = this.input().nativeElement;
    input.focus();
    try {
      // open the calendar, as the editor opens
      input.showPicker();
    } catch {
      // no picker (no user activation, or not supported)
    }
  }

  protected onChange() {
    if (!this.typing) {
      // a date picked from the calendar
      this.confirm();
    }
  }

  protected onKeydown(event: KeyboardEvent) {
    const { key } = event;
    if (key === 'Enter') {
      this.confirm();
    } else if (key === 'Escape') {
      this.cancel();
    } else {
      this.typing = true;
    }
    // the keys are for the date input, not for the grid
    event.stopPropagation();
  }

  private confirm() {
    const date = parseDate(this.input().nativeElement.value);
    if (!date) {
      this.cancel();
      return;
    }
    if (!this.done) {
      this.done = true;
      this.editor.confirmEdit(date);
    }
  }

  protected cancel() {
    if (!this.done) {
      this.done = true;
      this.editor.cancelEdit();
    }
  }
}

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName', header: 'First Name' },
  birthDate: {
    field: 'birthDate',
    header: 'Birth Date',
    // we need to specify the type of the column as "date"
    type: 'date',
  },
  dateHired: {
    field: 'dateHired',
    header: 'Date Hired',
    // we need to specify the type of the column as "date"
    type: 'date',
  },
  salary: {
    field: 'salary',
    header: 'Salary',
    type: 'number',
  },
  country: { field: 'country', header: 'Country' },
  preferredLanguage: { field: 'preferredLanguage' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="column-types-date-editor-example"
        [columnTypes]="columnTypes"
        [columns]="columns"
        [columnDefaultWidth]="120"
      />
    </infinite-data-source>

    <ng-template #dateValue let-value="value">
      <b>{{ formatDate(value) }}</b>
    </ng-template>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly formatDate = formatDate;

  private readonly dateValueTemplate =
    viewChild.required<TemplateRef<unknown>>('dateValue');

  protected readonly columnTypes: InfiniteTablePropColumnTypes<Developer> = {
    date: {
      defaultEditable: true,
      components: {
        Editor: DateEditor,
      },
      defaultWidth: 200,
      style: ({ inEdit }) => {
        return inEdit ? { padding: 0 } : {};
      },
      renderValue: () => this.dateValueTemplate(),
    },
  };
}

const dataSource: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    country: 'India',
    city: 'Unnao',
    birthDate: new Date(1997, 0, 1),
    dateHired: new Date(2023, 0, 1),
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    salary: 60000,
    hobby: 'sports',
    email: 'Nya44@gmail.com',
  },
  {
    id: 1,
    firstName: 'Axel',
    country: 'Mexico',
    city: 'Cuitlahuac',
    birthDate: new Date(1993, 3, 10),
    dateHired: new Date(2022, 5, 10),
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    salary: 100000,
    hobby: 'sports',
    email: 'Axel93@hotmail.com',
  },
  {
    id: 2,
    firstName: 'Gonzalo',
    country: 'United Arab Emirates',
    city: 'Fujairah',
    birthDate: new Date(1997, 10, 30),
    dateHired: new Date(2021, 8, 29),
    currency: 'JPY',
    preferredLanguage: 'Go',
    salary: 120000,
    hobby: 'photography',
    email: 'Gonzalo_McGlynn34@gmail.com',
  },
  {
    id: 3,
    firstName: 'Sherwood',
    country: 'Mexico',
    city: 'Tlacolula de Matamoros',
    birthDate: new Date(1990, 5, 20),
    dateHired: new Date(2021, 8, 20),
    currency: 'CHF',
    preferredLanguage: 'Rust',
    salary: 99000,
    hobby: 'cooking',
    email: 'Sherwood_McLaughlin65@hotmail.com',
  },
  {
    id: 4,
    firstName: 'Alexandre',
    country: 'France',
    city: 'Persan',
    birthDate: new Date(1990, 3, 20),
    dateHired: new Date(2023, 11, 12),
    currency: 'EUR',
    preferredLanguage: 'Go',
    salary: 97000,
    hobby: 'reading',
    email: 'Alexandre_Harber@hotmail.com',
  },
  {
    id: 5,
    firstName: 'Mariane',
    country: 'United States',
    city: 'Hays',
    birthDate: new Date(2002, 3, 20),
    dateHired: new Date(2022, 2, 22),
    currency: 'EUR',
    preferredLanguage: 'TypeScript',

    salary: 58000,
    hobby: 'cooking',
    email: 'Mariane0@hotmail.com',
  },
  {
    id: 6,
    firstName: 'Rosalind',
    country: 'Mexico',
    city: 'Nuevo Casas Grandes',
    birthDate: new Date(1992, 11, 12),
    dateHired: new Date(2022, 1, 12),
    currency: 'AUD',
    preferredLanguage: 'JavaScript',
    salary: 198000,
    hobby: 'dancing',
    email: 'Rosalind69@gmail.com',
  },
  {
    id: 7,
    firstName: 'Lolita',
    country: 'Sweden',
    city: 'Delsbo',
    birthDate: new Date(1990, 9, 5),
    dateHired: new Date(2022, 1, 5),
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    salary: 200000,
    hobby: 'cooking',
    email: 'Lolita.Hayes@hotmail.com',
  },
  {
    id: 8,
    firstName: 'Tre',
    country: 'Germany',
    city: 'Bad Camberg',
    birthDate: new Date(1990, 9, 15),
    dateHired: new Date(2022, 10, 1),
    currency: 'GBP',
    preferredLanguage: 'TypeScript',
    salary: 200000,
    hobby: 'sports',
    email: 'Tre28@gmail.com',
  },
  {
    id: 9,
    firstName: 'Lurline',
    country: 'Canada',
    city: 'Raymore',
    birthDate: new Date(1990, 4, 18),
    dateHired: new Date(2023, 3, 18),
    currency: 'EUR',
    preferredLanguage: 'Rust',
    salary: 58000,
    hobby: 'sports',
    email: 'Lurline_Deckow@gmail.com',
  },
];
