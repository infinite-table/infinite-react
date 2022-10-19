import { ElementHandle, Page } from '@playwright/test';

import {
  CellLocation,
  ColLocation,
  getCellInRow,
  getCellNodeLocator,
  getCellText,
  getColumnCells,
  getSelectedRowIds,
  isNodeExpanded,
  isNodeGroupRow,
  toggleGroupRow,
} from '.';

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
        colIndex,
        colId,
      },
      { page: this.page },
    );
  }

  getGroupCellLocator(cellLocation: CellLocation) {
    return getCellNodeLocator(cellLocation, { page: this.page });
  }

  async getTextForColumnCells(colLocation: ColLocation) {
    const { bodyCells } = await getColumnCells(colLocation, {
      page: this.page,
    });

    return await Promise.all(
      bodyCells.map(async (cell) => await cell.textContent()),
    );
  }

  async getRowHeight(rowIndex: number) {
    const locator = this.getCellLocator({
      rowIndex,
      colIndex: 0,
    });

    return await locator.evaluate(
      (node) => node.getBoundingClientRect().height,
    );
  }

  getCellLocator(cellLocation: CellLocation) {
    return getCellNodeLocator(cellLocation, { page: this.page });
  }

  async toggleGroupRow(rowIndex: number) {
    await toggleGroupRow({ rowIndex, colIndex: 0 }, { page: this.page });
  }

  async isRowExpanded(rowIndex: number) {
    const node = this.getCellLocator({
      rowIndex,
      colIndex: 0,
    });

    return await isNodeExpanded(node);
  }

  async isGroupRow(rowIndex: number) {
    const node = this.getCellLocator({
      rowIndex,
      colIndex: 0,
    });

    return await isNodeGroupRow(node);
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
