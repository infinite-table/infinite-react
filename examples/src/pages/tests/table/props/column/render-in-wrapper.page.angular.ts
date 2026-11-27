import { Component, TemplateRef, signal, viewChild } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
  renderComponent,
} from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'John', age: 20 },
  { id: 2, firstName: 'Marry', age: 25 },
  { id: 3, firstName: 'Bill', age: 30 },
];

// whether the wrappers render their content - set from the spec
const open = signal(true);

// projects its content inside a span, when open: the <ng-content> is in an
// @if, so it is rendered after the outlets projected into it got their
// content (and again each time it opens)
@Component({
  selector: 'render-in-wrapper',
  template: `<span data-name="wrapper">@if (open()) {<ng-content />}</span>`,
})
class Wrapper {
  protected readonly open = open;
}

@Component({
  selector: 'render-in-wrapper-badge',
  template: `<span data-name="badge">★</span>`,
})
class Badge {}

const domProps = {
  style: {
    height: '80vh',
  },
};

@Component({
  imports: [DataSource, InfiniteTable, InfiniteRender, Wrapper],
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [columns]="columns"
        [columnDefaultWidth]="200"
        [domProps]="domProps"
      />
    </infinite-data-source>

    <ng-template #firstNameHeader>
      <render-in-wrapper>
        <ng-container [infiniteRender]="['First ', boldName]" />
      </render-in-wrapper>
    </ng-template>
    <ng-template #boldName><b>name</b></ng-template>

    <ng-template #firstNameValue let-value="value">
      <render-in-wrapper>
        <ng-container [infiniteRender]="value" />
      </render-in-wrapper>
    </ng-template>

    <ng-template #ageValue let-value="value">
      <render-in-wrapper>
        <ng-container [infiniteRender]="[value, ' years ', badge]" />
      </render-in-wrapper>
    </ng-template>
  `,
})
export default class RenderInWrapperPage {
  protected readonly data = data;
  protected readonly domProps = domProps;
  protected readonly badge = renderComponent(Badge);

  private readonly firstNameHeader =
    viewChild.required<TemplateRef<unknown>>('firstNameHeader');
  private readonly firstNameValue =
    viewChild.required<TemplateRef<unknown>>('firstNameValue');
  private readonly ageValue =
    viewChild.required<TemplateRef<unknown>>('ageValue');

  constructor() {
    (globalThis as any).setWrappersOpen = (value: boolean) => {
      open.set(value);
    };
  }

  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    firstName: {
      field: 'firstName',
      header: () => this.firstNameHeader(),
      renderValue: () => this.firstNameValue(),
    },
    age: {
      field: 'age',
      type: 'number',
      renderValue: () => this.ageValue(),
    },
  };
}
