import { ElementHandle, Page } from '@playwright/test';

import {
  getCellInRow,
  getCellNodeLocator,
  getCellText,
  getSelectedRowIds,
} from '.';

type CellLocation = {
  colId?: string;
  colIndex?: number;
  rowIndex: number;
};
export class RowTestingModel {
  static get(page: Page) {
    return new RowTestingModel(page);
  }

  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getTextForCell({ colId, colIndex, rowIndex }: CellLocation) {
    return await getCellText(
      {
        rowIndex,
        colIndex: colIndex,
        columnId: colId,
      },
      { page: this.page },
    );
  }

  getCellLocator({ colId, colIndex, rowIndex }: CellLocation) {
    return getCellNodeLocator(
      {
        rowIndex,
        colIndex: colIndex,
        columnId: colId,
      },
      { page: this.page },
    );
  }

  async getCellComputedStylePropertyValue(
    cellLocation: CellLocation,
    propertyName: string,
  ) {
    const cell = this.getCellLocator(cellLocation);
    const node = await cell.elementHandle();

    return await this.page.evaluate(
      //@ts-ignore
      ({
        node,
        propertyName,
      }: {
        node: ElementHandle<HTMLElement>;
        propertyName: string;
      }) => {
        //@ts-ignore
        return getComputedStyle(node).getPropertyValue(propertyName);
      },
      { node, propertyName },
    );
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
