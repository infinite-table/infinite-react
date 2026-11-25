import { Component, input } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { Renderable } from '@infinite-table/infinite-angular';

import {
  type Developer,
  insertData as data,
  insertDataColumns as columns,
  height100DomProps,
} from './common';

const dataSource = () => {
  return new Promise<Developer[]>((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 500000);
  });
};

// the components.LoadMask override gets the same inputs as the default one
@Component({
  selector: 'div[customLoadMask]',
  host: {
    title: 'LoadMask',
    style:
      'color: magenta; display: flex; align-items: center; justify-content: center; opacity: 0.4; background: white; width: 100%; height: 100%; z-index: 100',
  },
  template: `xxx`,
})
class CustomLoadMask {
  readonly visible = input<boolean>(false);
  readonly loadingText = input<Renderable>();
}

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [components]="components"
        [columnDefaultWidth]="100"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class LoadMaskPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = height100DomProps;
  protected readonly components = { LoadMask: CustomLoadMask };
}
