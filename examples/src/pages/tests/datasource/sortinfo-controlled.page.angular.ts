import { Component, computed, signal } from '@angular/core';

import { DataSource, injectDataSource } from '@infinite-table/infinite-angular';
import type { DataSourceSortInfo } from '@infinite-table/infinite-angular';

import { Person, persons } from './sortPersons';

@Component({
  selector: 'data-array-view',
  template: `<div>{{ text() }}</div>`,
})
class Cmp {
  private readonly context = injectDataSource<Person>();

  protected readonly text = computed(() => {
    const { dataArray, loading } = this.context.state();
    return loading ? 'loading' : JSON.stringify(dataArray);
  });
}

(globalThis as any).calls = 0;

const sortInfo = signal<DataSourceSortInfo<Person>>({
  dir: 1,
  field: 'age',
});

(globalThis as any).setSortInfo = (info: DataSourceSortInfo<Person>) => {
  sortInfo.set(info);
};

@Component({
  imports: [DataSource, Cmp],
  template: `
    <p>Currently the sorting is {{ enabled() ? 'enabled' : 'disabled' }}</p>
    <button (click)="toggle()">
      Toggle - click the toggle to
      {{ enabled() ? 'disable' : 'enable' }} sortInfo
    </button>
    <div id="source">
      <infinite-data-source
        [data]="persons"
        primaryKey="id"
        [fields]="fields"
        [sortInfo]="sortInfo()"
        (sortInfoChange)="onSortInfoChange($event)"
      >
        <data-array-view />
      </infinite-data-source>
    </div>
  `,
})
export default class SortInfoControlledPage {
  protected readonly persons = persons;
  protected readonly fields: (keyof Person)[] = ['name', 'id', 'age'];
  protected readonly sortInfo = sortInfo;
  protected readonly enabled = signal(false);

  protected onSortInfoChange(
    info: DataSourceSortInfo<Person> | null | undefined,
  ) {
    (globalThis as any).calls++;
    console.log(info);
    if (this.enabled()) {
      sortInfo.set(info as DataSourceSortInfo<Person>);
    }
  }

  protected toggle() {
    this.enabled.set(!this.enabled());
  }
}
