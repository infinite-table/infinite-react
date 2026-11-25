import { Component, DestroyRef, inject } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import { shadcnVarsCSS } from './shadcnVars';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  stack: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'Ana', country: 'Italy', stack: 'frontend', age: 30 },
  { id: 2, firstName: 'Bob', country: 'Italy', stack: 'backend', age: 40 },
  { id: 3, firstName: 'Cid', country: 'France', stack: 'frontend', age: 35 },
  { id: 4, firstName: 'Dan', country: 'France', stack: 'backend', age: 50 },
  { id: 5, firstName: 'Eve', country: 'Spain', stack: 'fullstack', age: 28 },
  { id: 6, firstName: 'Fay', country: 'Spain', stack: 'backend', age: 45 },
];

const columns: Record<string, any> = {
  id: { field: 'id', type: 'number', defaultWidth: 80 },
  firstName: { field: 'firstName' },
  country: { field: 'country' },
  stack: { field: 'stack' },
  age: { field: 'age', type: 'number' },
};

const columnPinning = { id: 'start' as const };

const rowDisabledState = {
  enabledRows: true as const,
  disabledRows: [2, 3],
};

const defaultFilterValue: any[] = [];

const domProps = {
  style: {
    height: '100%',
  },
};

const sectionStyle = {
  flex: 1,
  padding: '10px',
  background: 'var(--background)',
  color: 'var(--foreground)',
};

// The shadcn theme takes its colors from the shadcn/ui CSS variables of the
// page, which are in dark mode under the `dark` className.
//
// No `infinite-theme-mode--*` className is used here.
const sections = [
  { name: 'light', className: 'infinite-theme-name--shadcn' },
  { name: 'dark', className: 'dark infinite-theme-name--shadcn' },
];

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
  <div style="display: flex; height: 80vh">
    @for (section of sections; track section.name) {
      <div
        [attr.data-name]="section.name"
        [style]="sectionStyle"
        [class]="section.className"
      >
        <infinite-data-source
          primaryKey="id"
          [data]="data"
          [defaultFilterValue]="defaultFilterValue"
          [defaultRowDisabledState]="rowDisabledState"
        >
          <infinite-table
            [domProps]="domProps"
            [columns]="columns"
            [columnDefaultWidth]="140"
            [defaultColumnPinning]="columnPinning"
            [defaultActiveRowIndex]="0"
            keyboardNavigation="row"
          />
        </infinite-data-source>
      </div>
    }
  </div>
  `,
})
export default class ShadcnDarkPage {
  constructor() {
    // Vue: <component :is="'style'">{{ shadcnVarsCSS }}</component>
    const style = document.createElement('style');
    style.textContent = shadcnVarsCSS;
    document.head.appendChild(style);
    inject(DestroyRef).onDestroy(() => style.remove());
  }

  protected readonly sectionStyle = sectionStyle;
  protected readonly sections = sections;
  protected readonly columnPinning = columnPinning;
  protected readonly columns = columns;
  protected readonly data = data;
  protected readonly defaultFilterValue = defaultFilterValue;
  protected readonly domProps = domProps;
  protected readonly rowDisabledState = rowDisabledState;
}
