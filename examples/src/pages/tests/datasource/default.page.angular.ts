import { Component, computed } from '@angular/core';

import { DataSource, injectDataSource } from '@infinite-table/infinite-angular';

interface Person {
  name: string;
  age: number;
  id: string | number;
}

const persons: Person[] = [
  { name: 'bob', age: 1, id: 1 },
  { name: 'bill', age: 2, id: 2 },
];

@Component({
  selector: 'data-array-view',
  template: `
    <div aria-label="container" style="color: tomato">{{ text() }}</div>
  `,
})
class Cmp {
  private readonly context = injectDataSource<Person>();

  protected readonly text = computed(() => {
    const { dataArray, loading } = this.context.state();
    return loading ? 'loading' : JSON.stringify(dataArray);
  });
}

const personsPromise: Promise<Person[]> = new Promise((resolve) => {
  setTimeout(() => {
    resolve(persons);
  }, 200);
});

@Component({
  imports: [DataSource, Cmp],
  template: `
    <infinite-data-source
      [data]="personsPromise"
      primaryKey="id"
      [fields]="fields"
    >
      <data-array-view />
    </infinite-data-source>
  `,
})
export default class DataSourceDefaultPage {
  protected readonly personsPromise = personsPromise;
  protected readonly fields: (keyof Person)[] = ['name', 'id', 'age'];
}
