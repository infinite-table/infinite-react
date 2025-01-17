import { Page } from '@playwright/test';
import {
  CellLocation,
  ColLocation,
  getHeaderCellWidthByColumnId,
  getHeaderColumnIds,
  getLocatorComputedStylePropertyValue,
  RowLocation,
} from '.';
import { ColumnTestingModel } from './ColumnTestingModel';
import { HeaderTestingModel } from './HeaderTestingModel';
import { RowTestingModel } from './RowTestingModel';

export class TableTestingModel {
  static get(page: Page) {
    return new TableTestingModel(page);
  }

  private page: Page;
  private rowModel: RowTestingModel;
  private columnModel: ColumnTestingModel;
  private headerModel: HeaderTestingModel;

  constructor(page: Page) {
    this.page = page;

    this.rowModel = new RowTestingModel(page);
    this.columnModel = new ColumnTestingModel(page);
    this.headerModel = new HeaderTestingModel(page);
  }

  withHeader() {
    return {
      getColumnHeaders: async () => {
        const colIds = await this.columnModel.getVisibleColumnIds();

        return await Promise.all(
          colIds.map(
            async (colId) =>
              await this.headerModel.getTextForHeaderCell({ colId }),
          ),
        );
      },
    };
  }

  async getVisibleColumnIds() {
    return await this.columnModel.getVisibleColumnIds();
  }

  withColumn(colLocation: ColLocation) {
    function getCellLocation(rowLocation: RowLocation) {
      const cellLocation: CellLocation = {
        ...rowLocation,
        ...(typeof colLocation === 'string'
          ? {
              colId: colLocation,
            }
          : colLocation),
      };

      return cellLocation;
    }
    return {
      getHeader: async () => {
        return await this.headerModel.getTextForHeaderCell(colLocation);
      },
      getCellValue: async (rowLocation: number | RowLocation) => {
        if (typeof rowLocation === 'number') {
          rowLocation = {
            rowIndex: rowLocation,
          };
        }
        const cellLocation = getCellLocation(rowLocation);
        return await this.rowModel.getTextForCell(cellLocation);
      },
      getCellComputedStyleProperty: async (
        rowLocation: RowLocation,
        styleName: string,
      ) => {
        const cellLocation = getCellLocation(rowLocation);
        return await this.columnModel.getCellComputedStyleProperty(
          cellLocation,
          styleName,
        );
      },
      getHeaderComputedStyleProperty: async (styleName: string) => {
        return await getLocatorComputedStylePropertyValue({
          handle: this.headerModel.getHeaderCellLocator(colLocation),
          page: this.page,
          propertyName: styleName,
        });
      },
      clickHeader: async () => {
        await this.headerModel.clickColumnHeader(colLocation);
      },
      clickToSort: async ({ ctrlKey } = { ctrlKey: false }) => {
        await this.headerModel.clickToSortColumn(colLocation, { ctrlKey });
        return;
      },
      getValues: async () => {
        return await this.rowModel.getTextForColumnCells(colLocation);
      },
      resize: async (diff: number) => {
        await this.columnModel.resizeColumn(colLocation, diff);
      },

      getWidth: async () => {
        return await getHeaderCellWidthByColumnId(colLocation, {
          page: this.page,
        });
      },
      isDisplayed: async () => {
        let colId: string = '';
        if (typeof colLocation === 'string') {
          colId = colLocation;
        } else {
          colId = colLocation.colId || '';

          if (!colId) {
            const colIndex = colLocation.colIndex || 0;
            const colIds = await getHeaderColumnIds({ page: this.page });
            colId = colIds[colIndex];
          }
        }

        return await this.columnModel.isColumnDisplayed(colId);
      },
    };
  }

  withCell(cellLocation: CellLocation) {
    const getTreeIcon = () => {
      return this.rowModel
        .getCellLocator(cellLocation)
        .locator('[data-name="expand-collapse-icon"]');
    };

    const result = {
      getComputedStyleProperty: async (styleName: string) => {
        return await this.columnModel.getCellComputedStyleProperty(
          cellLocation,
          styleName,
        );
      },

      getTreeIcon: () => {
        return getTreeIcon();
      },

      isVisible: async () => {
        return await result.getLocator().isVisible();
      },

      isTreeIconExpanded: async () => {
        const icon = getTreeIcon();
        return (await icon.getAttribute('data-state')) === 'expanded';
      },

      isTreeIconDisabled: async () => {
        const icon = getTreeIcon();
        return (await icon.getAttribute('data-disabled')) === 'true';
      },

      getLocator: () => {
        return this.rowModel.getCellLocator(cellLocation);
      },

      getValue: async () => {
        return await this.rowModel.getTextForCell(cellLocation);
      },
      getRowValues: async () => {
        const rowLocator: RowLocation = cellLocation;
        const colIds = await this.columnModel.getVisibleColumnIds();

        return await Promise.all(
          colIds.map(
            async (colId) =>
              await this.rowModel.getTextForCell({
                ...rowLocator,
                colId,
              }),
          ),
        );
      },

      clickDetailIcon: async () => {
        const cellLocator = this.rowModel.getCellLocator(cellLocation);

        const icon = cellLocator.locator('[data-name="expand-collapse-icon"]');

        await icon.click();
      },

      withColumn: () => {
        return this.withColumn(cellLocation);
      },

      getColumnValues: async () => {
        return await this.rowModel.getTextForColumnCells({
          ...cellLocation,
        });
      },
    };
    return result;
  }
}
