import { Component } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectHeaderCell,
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

// the host element of the component is the header cell
@Component({
  selector: 'div[hobbyHeader]',
  template: `<b style="color: #0000c2">{{ headerCell().column.field }} 🤷📸👨🏻‍🍳💃📚⛹️</b>`,
})
class HobbyHeader {
  // #highlight a signal with the information of the header cell
  protected readonly headerCell = injectHeaderCell<Developer>();
}

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', maxWidth: 80 },
  stack: {
    field: 'stack',
  },
  hobby: {
    field: 'hobby',
    components: {
      HeaderCell: HobbyHeader,
    },
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="column-header-hooks-example"
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
