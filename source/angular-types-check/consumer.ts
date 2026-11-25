/**
 * A consumer of the built @infinite-table/infinite-angular package, compiled
 * by check-angular-package.cjs in full AOT mode with strict templates.
 *
 * It only compiles if the package's type declarations carry the Ivy
 * metadata of its directives and components, with the right input types.
 */
import { Component, TemplateRef, viewChild } from '@angular/core';
import {
  InfiniteRender,
  renderComponent,
  renderTemplate,
  type Renderable,
} from '@infinite-table/infinite-angular';

@Component({
  selector: 'consumer-badge',
  template: `<b>badge</b>`,
})
class Badge {}

@Component({
  selector: 'consumer-app',
  imports: [InfiniteRender],
  template: `
    <ng-template #tpl let-value>{{ value }}</ng-template>
    <ng-container [infiniteRender]="content" [infiniteRenderContext]="{ $implicit: 1 }" />
    <ng-container [infiniteRender]="'text'" />
  `,
})
export class ConsumerApp {
  protected readonly tpl = viewChild.required<TemplateRef<{ $implicit: number }>>('tpl');

  protected get content(): Renderable {
    return [renderTemplate(this.tpl(), { $implicit: 2 }), renderComponent(Badge), 3];
  }
}
