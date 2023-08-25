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
  async evaluate(evaluateFn: (api: InfiniteTableApi<any>) => void) {
    return this.page.evaluate((evaluateFn) => {
      const api = (window as any).INFINITE_GRID_API as InfiniteTableApi<any>;
      const fn = eval(evaluateFn);
      return fn(api);
    }, evaluateFn.toString());
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
}
