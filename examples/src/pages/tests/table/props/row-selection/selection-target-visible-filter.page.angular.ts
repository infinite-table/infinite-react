import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  preferredLanguage: string;
};

const data: Developer[] = [
  { id: 1, firstName: 'Nya', preferredLanguage: 'Java' },
  { id: 2, firstName: 'Axel', preferredLanguage: 'JavaScript' },
  { id: 3, firstName: 'Gonzalo', preferredLanguage: 'TypeScript' },
  { id: 4, firstName: 'Sherwood', preferredLanguage: 'Java' },
  { id: 5, firstName: 'Mark', preferredLanguage: 'Rust' },
  { id: 6, firstName: 'Alex', preferredLanguage: 'JavaScript' },
];

const columns: Record<string, any> = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 80 },
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
};

const domProps = { style: { height: '60vh' } };

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <label style="display: block; padding: 10px; color: tomato">
      Language starts with
      <input
        data-name="language-prefix"
        [value]="languagePrefix()"
        (input)="onLanguagePrefixInput($event)"
      />
    </label>
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      selectionMode="multi-row"
      multiRowSelectionTarget="visible"
      [filterFunction]="filterFunction()"
    >
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class SelectionTargetVisibleFilterPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  protected readonly languagePrefix = signal('Java');

  protected readonly filterFunction = computed(() => {
    const prefix = this.languagePrefix();
    return prefix
      ? ({ data }: { data: Developer }) =>
          data.preferredLanguage.startsWith(prefix)
      : undefined;
  });

  constructor() {
    (globalThis as any).setLanguagePrefix = (value: string) => {
      this.languagePrefix.set(value);
    };
  }

  protected onLanguagePrefixInput(event: Event) {
    this.languagePrefix.set((event.target as HTMLInputElement).value);
  }
}
