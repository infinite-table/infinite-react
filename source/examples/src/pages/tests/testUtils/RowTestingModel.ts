import { Page } from '@playwright/test';
import { getCellInRow, getSelectedRowIds } from '.';

export class RowTestingModel {
  static get(page: Page) {
    return new RowTestingModel(page);
  }

  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickRow(rowIndex: number) {
    const cell = getCellInRow(
      {
        rowIndex,
      },
      { page: this.page },
    );

    await cell.click();

    return cell;
  }

  async getSelectedRowIdsForVisibleRows() {
    return await getSelectedRowIds({ page: this.page });
  }

  async getRenderedRowCount() {
    return await this.page.$$eval(
      '.InfiniteColumnCell[data-row-index][data-col-index="0"]',
      (rows) => rows.length,
    );
  }
}
