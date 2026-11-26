import { Component, computed } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectColumnCell,
  renderComponent,
} from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

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

const EMOJIS: Record<string, string> = {
  photography: '📸',
  cooking: '👨🏻‍🍳',
  dancing: '💃',
  reading: '📚',
  sports: '⛹️',
};

@Component({
  selector: 'custom-cell',
  template: `<b>{{ emoji() }} + {{ label() }}</b>`,
})
class CustomCell {
  // #highlight a signal with the same information the render function receives
  private readonly cell = injectColumnCell<Developer>();

  protected readonly emoji = computed(() => EMOJIS[this.cell().value] ?? '🤷');
  protected readonly label = computed(() =>
    this.cell().data?.stack === 'frontend' ? '⚛️' : '',
  );
}

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', maxWidth: 80 },
  firstName: { field: 'firstName' },
  hobby: {
    field: 'hobby',
    // we're not using the arg of the render function directly
    // but CustomCell uses `injectColumnCell()` to retrieve it instead
    render: () => renderComponent(CustomCell),
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="column-render-hooks-example"
        [columns]="columns"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
}
