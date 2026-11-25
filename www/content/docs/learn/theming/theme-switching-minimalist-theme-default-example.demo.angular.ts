import { Component, ViewEncapsulation, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns } from './columns.angular';
import type { Employee } from './columns.angular';

type ThemeName = 'default' | 'minimalist' | 'ocean' | 'balsam' | 'shadcn';

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => {
      console.log(data);
      return data;
    });
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  // global styles: an Angular application lists the theme CSS files (and the
  // shadcn variables) in the global styles, not in a component
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* the shadcn CSS variables the shadcn theme reads (shadcn-ui-css-vars) */
    :root {
      --background: oklch(1 0 0);
      --foreground: oklch(0.145 0 0);
      --popover-foreground: oklch(0.145 0 0);
      --primary: oklch(0.205 0 0);
      --muted: oklch(0.97 0 0);
      --muted-foreground: oklch(0.556 0 0);
      --accent: oklch(0.97 0 0);
      --destructive: oklch(0.577 0.245 27.325);
      --border: oklch(0.922 0 0);
      --input: oklch(0.922 0 0);
    }
    .dark {
      --background: oklch(0.145 0 0);
      --foreground: oklch(0.985 0 0);
      --popover-foreground: oklch(0.985 0 0);
      --primary: oklch(0.985 0 0);
      --muted: oklch(0.269 0 0);
      --muted-foreground: oklch(0.708 0 0);
      --accent: oklch(0.269 0 0);
      --destructive: oklch(0.396 0.141 25.723);
      --border: oklch(0.269 0 0);
      --input: oklch(0.269 0 0);
    }
  `,
  template: `
    <!-- #highlight the theme name and mode classes, on a parent element of the grid -->
    <div
      [class]="themeClassName()"
      style="display: flex; flex-flow: column; flex: 1; color: var(--infinite-cell-color); background: var(--infinite-background)"
    >
      <infinite-data-source [data]="dataSource" primaryKey="id">
        <infinite-table debugId="theme-switching-minimalist-theme-default-example" [columns]="columns" />
      </infinite-data-source>

      <div style="margin: 10px">
        Current settings: <b>{{ currentThemeName() }}</b> theme,
        <b>{{ currentThemeMode() }}</b> mode.
      </div>
      <div
        style="display: flex; flex-flow: row; align-items: center; gap: 10px; padding: 10px"
      >
        Select theme
        <select
          title="Select theme"
          [value]="currentThemeName()"
          (change)="setThemeName($event)"
        >
          <option value="shadcn">Shadcn</option>
          <option value="ocean">Ocean</option>
          <option value="balsam">Balsam</option>
          <option value="minimalist">Minimalist</option>
          <option value="default">Default</option>
        </select>
        <button (click)="toggleThemeMode()">
          Switch to {{ currentThemeMode() === 'dark' ? 'light' : 'dark' }} mode.
        </button>
      </div>
    </div>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;

  protected readonly currentThemeMode = signal<'light' | 'dark'>('dark');
  protected readonly currentThemeName = signal<ThemeName>('minimalist');

  protected readonly themeClassName = computed(() => {
    const mode = this.currentThemeMode();
    const name = this.currentThemeName();
    return `infinite-theme-mode--${mode} infinite-theme-name--${name} ${
      name === 'shadcn' && mode === 'dark' ? 'dark' : ''
    }`;
  });

  protected setThemeName(event: Event) {
    this.currentThemeName.set(
      (event.target as HTMLSelectElement).value as ThemeName,
    );
  }

  protected toggleThemeMode() {
    this.currentThemeMode.set(
      this.currentThemeMode() === 'dark' ? 'light' : 'dark',
    );
  }
}
