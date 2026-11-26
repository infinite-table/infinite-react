/**
 * A consumer of the built @infinite-table/infinite-angular package, compiled
 * by check-angular-package.cjs in full AOT mode with strict templates.
 *
 * It only compiles if the package's type declarations carry the Ivy
 * metadata of its directives and components, with the right input types.
 */
import { Component, TemplateRef, signal, viewChild } from '@angular/core';
import {
  DataSource,
  InfiniteRender,
  type DataSourceApi,
  type DataSourcePropSortInfo,
  renderComponent,
  renderTemplate,
  type Renderable,
} from '@infinite-table/infinite-angular';

type Person = { id: number; name: string };

@Component({
  selector: 'consumer-badge',
  template: `<b>badge</b>`,
})
class Badge {}

@Component({
  selector: 'consumer-app',
  imports: [InfiniteRender, DataSource],
  template: `
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="data"
      [(sortInfo)]="sortInfo"
      useGroupKeysForMultiRowSelection
      (ready)="onReady($event)"
    >
      {{ ds.dataArray().length }}
    </infinite-data-source>
    <ng-template #tpl let-value>{{ value }}</ng-template>
    <ng-container [infiniteRender]="content" [infiniteRenderContext]="{ $implicit: 1 }" />
    <ng-container [infiniteRender]="'text'" />
  `,
})
export class ConsumerApp {
  protected readonly data: Person[] = [{ id: 1, name: 'Ada' }];
  protected readonly sortInfo = signal<DataSourcePropSortInfo<Person> | undefined>(
    undefined,
  );
  protected onReady(api: DataSourceApi<Person>) {
    api.getRowInfoArray();
  }

  protected readonly tpl = viewChild.required<TemplateRef<{ $implicit: number }>>('tpl');

  protected get content(): Renderable {
    return [renderTemplate(this.tpl(), { $implicit: 2 }), renderComponent(Badge), 3];
  }
}
