import { TreeApi } from '@src/components/DataSource/TreeApi';
import { Page } from '@playwright/test';
import { DataSourceApi } from '@src/components/DataSource/types';
import { InfiniteTableApi } from '@src/components/InfiniteTable/types';

export class InfiniteTableApiModel {
  static get(page: Page) {
    return new InfiniteTableApiModel(page);
  }

  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  async evaluate<T = any>(
    evaluateFn: (api: InfiniteTableApi<any>, ...args: any[]) => T,
    ...args: any[]
  ) {
    return this.page.evaluate(
      ([evaluateFn, ...args]) => {
        const api = (window as any).INFINITE_GRID_API as InfiniteTableApi<any>;
        const fn = eval(evaluateFn);
        return fn(api, ...args) as T;
      },
      [evaluateFn.toString(), ...args],
    );
  }

  async evaluateDataSource(
    evaluateFn: (dataSourceApi: DataSourceApi<any>) => void,
  ) {
    return this.page.evaluate((evaluateFn) => {
      const api = (window as any).DATA_SOURCE_API as DataSourceApi<any>;
      const fn = eval(evaluateFn);
      return fn(api);
    }, evaluateFn.toString());
  }

  async evaluateTreeApi(evaluateFn: (treeApi: TreeApi<any>) => void) {
    return this.page.evaluate((evaluateFn) => {
      const api = (window as any).DATA_SOURCE_API as DataSourceApi<any>;

      const fn = eval(evaluateFn);
      return fn(api.treeApi);
    }, evaluateFn.toString());
  }
}
