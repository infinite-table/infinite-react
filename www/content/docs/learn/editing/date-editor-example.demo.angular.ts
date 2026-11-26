import {
  Component,
  ElementRef,
  computed,
  input,
  viewChild,
} from '@angular/core';
import type { AfterViewInit } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectColumnEditor,
  renderComponent,
} from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  birthDate: Date;
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

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

// YYYY-MM-DD - also the value format of <input type="date">
const formatDate = (date: Date) =>
  [
    pad(date.getFullYear(), 4),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-');

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

@Component({
  selector: 'date-editor',
  host: { style: 'display: block; width: 100%; height: 100%' },
  template: `
    <input
      #input
      type="date"
      style="
        width: 100%;
        height: 100%;
        background: white;
        color: black;
        padding: 3px;
        box-sizing: border-box;
      "
      [value]="initialValue"
      (keydown)="onKeydown($event)"
      (pointerdown)="typing = false"
      (change)="onChange()"
      (blur)="cancel()"
    />
  `,
})
class DateEditor implements AfterViewInit {
  private readonly editor = injectColumnEditor();
  private readonly input =
    viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected readonly initialValue = formatDate(this.editor.initialValue);

  // a day picked in the calendar confirms the edit right away,
  // a date typed with the keyboard waits for Enter
  protected typing = false;
  private done = false;

  ngAfterViewInit() {
    const input = this.input().nativeElement;
    input.focus();
    try {
      // open the calendar right away
      input.showPicker();
    } catch {
      // the browser doesn't allow it here
    }
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.stopPropagation();
      this.confirm();
    } else if (event.key === 'Escape') {
      this.cancel();
    } else {
      this.typing = true;
      // keep the arrow keys in the date input, not in the grid
      event.stopPropagation();
    }
  }

  protected onChange() {
    if (!this.typing) {
      this.confirm();
    }
  }

  private confirm() {
    const { value } = this.input().nativeElement;
    if (!value) {
      // not a valid date
      this.cancel();
      return;
    }
    this.done = true;
    this.editor.confirmEdit(parseDate(value));
  }

  protected cancel() {
    if (!this.done) {
      this.done = true;
      this.editor.cancelEdit();
    }
  }
}

@Component({
  selector: 'date-value',
  template: `<b>{{ text() }}</b>`,
})
class DateValue {
  // set from the cell: the inputs named like the render params get their values
  readonly value = input.required<Date>();

  protected readonly text = computed(() => formatDate(this.value()));
}

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName', header: 'First Name' },
  birthDate: {
    field: 'birthDate',
    header: 'Birth Date',
    // we need to specify the type of the column as "date"
    type: 'date',
    defaultEditable: true,
    defaultWidth: 200,
    components: {
      Editor: DateEditor,
    },
    style: ({ inEdit }) => {
      return inEdit ? { padding: 0 } : {};
    },
    renderValue: () => renderComponent(DateValue),
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

const dataSource: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    country: 'India',
    city: 'Unnao',
    birthDate: new Date(1997, 0, 1),
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
    currency: 'EUR',
    preferredLanguage: 'Rust',
    salary: 58000,
    hobby: 'sports',
    email: 'Lurline_Deckow@gmail.com',
  },
];

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="date-editor-example"
        [columns]="columns"
        [columnDefaultWidth]="120"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
}
