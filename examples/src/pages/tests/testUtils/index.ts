import { Page, ElementHandle, Locator } from '@playwright/test';

import { kebabCase } from './kebabCase';
import { sortElements } from './listUtils';

export { getRow, getRows } from './getRowElement';

export const wait = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
};

export const resizeHandle = async (
  diff: number,
  handle: Locator,
  page: Page,
) => {
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + diff, 0);
  await page.mouse.up();
};

export const getLocatorComputedStylePropertyValue = async (params: {
  handle: Locator;
  page: Page;
  propertyName: string;
}) => {
  const { page, handle, propertyName } = params;
  const node = await handle.elementHandle();

  return await page.evaluate(
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
};

export const resizeColumnById = async (
  colId: string,
  diff: number,
  { page }: { page: Page },
) => {
  const colHeaderCell = getHeaderCellForColumn({ colId }, { page });

  const handle = await colHeaderCell.locator(
    '.InfiniteHeaderCell_ResizeHandle',
  );

  await resizeHandle(diff, handle, page);
};

export const resizeColumnGroupById = async (
  columnGroupId: string,
  diff: number,
  { page }: { page: Page },
) => {
  const groupCell = page.locator(
    `.InfiniteHeader [data-group-id^="${columnGroupId}"]`,
  );

  const handle = await groupCell.locator('.InfiniteHeaderCell_ResizeHandle');

  await resizeHandle(diff, handle, page);
};

export const getHeaderCellForColumn = (
  colLocation: ColLocation,
  {
    page,
  }: {
    page: Page;
  },
) => {
  const selector = `.InfiniteHeader ${getColSelector(colLocation)}`;
  return page.locator(selector).last();
};

export const getCellNode = async (
  { columnId, rowIndex }: { columnId: string; rowIndex: number },
  { page }: { page: Page },
) => {
  return await page.$(
    `.InfiniteColumnCell[data-row-index="${rowIndex}"][data-column-id="${columnId}"]`,
  );
};

export const getCellNodeLocator = (
  { colId, rowIndex, colIndex }: CellLocation,
  { page }: { page: Page },
) => {
  const colSelector = colId
    ? `[data-column-id="${colId}"]`
    : `[data-col-index="${colIndex}"]`;
  return page.locator(
    `.InfiniteColumnCell[data-row-index="${rowIndex}"]${colSelector}`,
  );
};

export const isNodeExpanded = async (node: Locator) => {
  return await node.evaluate((n) =>
    n.classList.contains('InfiniteColumnCell--group-row-expanded'),
  );
};
export const isNodeGroupRow = async (node: Locator) => {
  return await node.evaluate((n) =>
    n.classList.contains('InfiniteColumnCell--group-row'),
  );
};

export const isNodeTreeNode = async (node: Locator) => {
  return await node.evaluate((n) =>
    n.classList.contains('InfiniteColumnCell--tree-node'),
  );
};
export const isNodeTreeLeafNode = async (node: Locator) => {
  return await node.evaluate((n) =>
    n.classList.contains('InfiniteColumnCell--tree-leaf-node'),
  );
};
export const isNodeTreeParentNode = async (node: Locator) => {
  return await node.evaluate((n) =>
    n.classList.contains('InfiniteColumnCell--tree-parent-node'),
  );
};

export const isRowDisabled = async (node: Locator) => {
  return await node.evaluate((n) =>
    n.classList.contains('InfiniteColumnCell--disabled'),
  );
};

export const getCellInRow = (
  { rowIndex }: { rowIndex: number },
  { page }: { page: Page },
) => {
  return page
    .locator(`.InfiniteColumnCell[data-row-index="${rowIndex}"]`)
    .first();
};

export const getFirstChild = (locator: Locator) => {
  return locator.locator(':first-child').first();
};

export const getHeaderCellWidthByColumnId = async (
  colLocation: ColLocation,
  { page }: { page: Page },
): Promise<number> => {
  const node = getHeaderCellForColumn(colLocation, { page });

  const value = await node.evaluate(
    (node) => node.getBoundingClientRect().width,
  );
  return value;
};

export const getColumnWidths = async (
  colIds: ColLocation[],
  { page }: { page: Page },
) => {
  return await Promise.all(
    colIds.map(async (colLocation) => {
      return await getHeaderCellWidthByColumnId(colLocation, { page });
    }),
  );
};

export const getColumnOffsetById = async (
  colId: string,
  { page }: { page: Page },
) => {
  const node = getHeaderCellForColumn({ colId }, { page });

  const value = await node!.evaluate((node) => {
    const matrix = getComputedStyle(node).transform;
    const translatex = matrix.slice('.matrix('.length, -1).split(',')[4];

    return parseInt(translatex);
  });
  return value;
};

export const getColumnIdByIndex = async (
  colLocation: ColLocation,
  { page }: { page: Page },
) => {
  const node = getHeaderCellForColumn(colLocation, { page });

  return await node.getAttribute('data-column-id');
};

export const getHeaderColumnCells = async ({ page }: { page: Page }) => {
  const cells = page.locator(`.InfiniteHeader [data-column-id]`);

  const result = await sortElements(cells, 'col');

  return result;
};

export const getSelectedRowIds = async ({ page }: { page: Page }) => {
  const cells = await page.locator(
    `.InfiniteColumnCell[data-col-index="0"].InfiniteColumnCell--row-selected`,
  );

  const result = await sortElements(cells, 'row');

  const selectedRowIds = await Promise.all(
    result.map(async (el) => await el.evaluate((node) => node.dataset.rowId)),
  );

  return selectedRowIds;
};

export const getColumnOffsetsFromDOM = async ({ page }: { page: Page }) => {
  const cells = await getHeaderColumnCells({ page });

  const offsets = await Promise.all(
    cells.map(async (cell) =>
      cell.evaluate((node) => {
        const matrixValue = getComputedStyle(node).transform;

        function stripMatrixString(value: string) {
          return value.slice(7, -1);
        }
        return parseInt(stripMatrixString(matrixValue).split(',')[4]);
      }),
    ),
  );

  return offsets;
};

export const getScrollPosition = async ({ page }: { page: Page }) => {
  const scroller = page.locator('.InfiniteBody > :first-child');

  return await scroller.evaluate((node) => {
    return {
      scrollLeft: node.scrollLeft,
      scrollTop: node.scrollTop,
    };
  });
};

export const getScrollerLocator = async ({ page }: { page: Page }) => {
  return page.locator('.InfiniteBody > :first-child');
};

export const getMenuCellLocatorForKey = (
  params: { rowKey: string | null; colName?: string },
  { page }: { page: Page },
) => {
  const { rowKey, colName } = params;
  return page.locator(
    `[data-menu-item-key${rowKey ? `="${rowKey}"` : ''}]` +
      (colName ? `[data-menu-col-name="${colName}"]` : ''),
  );
};

export const getActiveCellIndicatorLocator = ({ page }: { page: Page }) => {
  return page.locator('[data-name="active-cell-indicator"]');
};
export const getActiveCellIndicatorOffsetFromDOM = async ({
  page,
}: {
  page: Page;
}) => {
  const indicatorNode = getActiveCellIndicatorLocator({ page });

  return await indicatorNode.evaluate((node) => {
    const [_1, _2, _3, _4, xPos, yPos] = getComputedStyle(node)
      .transform.split('matrix(')[1]
      .split(')')[0]
      .split(',')
      .map((x) => x.trim())
      .map(Number);

    return [xPos, yPos];
  });
};

export const getActiveRowIndicatorOffsetFromDOM = async ({
  page,
}: {
  page: Page;
}) => {
  const indicatorNode = page.locator('[data-name="active-row-indicator"]');

  return await indicatorNode.evaluate((node) => {
    const matrixValue = getComputedStyle(node).transform;

    function stripMatrixString(value: string) {
      return value.slice(7, -1);
    }
    return parseInt(stripMatrixString(matrixValue).split(',')[5]);
  });
};

export type ColLocation =
  | {
      colIndex?: number;
      colId?: string;
    }
  | string;

export type RowLocation = {
  rowIndex: number;
};
export type CellLocation = {
  colIndex?: number;
  colId?: string;
} & RowLocation;

const getColSelector = (colLocation: ColLocation) => {
  if (typeof colLocation === 'string') {
    colLocation = { colId: colLocation };
  }
  const colSelector = colLocation.colId
    ? `[data-column-id="${colLocation.colId}"]`
    : `[data-col-index="${colLocation.colIndex}"]`;

  return colSelector;
};

export const getColumnCells = async (
  colLocation: ColLocation,
  { page }: { page: Page },
) => {
  const colSelector = getColSelector(colLocation);
  const headerCell = page.locator(`.InfiniteHeader ${colSelector}`);

  const bodyCells = await page.locator(`.InfiniteColumnCell${colSelector}`);

  const cells = await sortElements(bodyCells);

  return {
    headerCell,
    bodyCells: cells,
  };
};

export const toggleGroupRow = async (
  { rowIndex, colIndex }: { rowIndex: number; colIndex?: number },
  { page }: { page: Page },
) => {
  const locator = getCellNodeLocator(
    { rowIndex, colIndex: colIndex || 0 },
    { page },
  );
  await locator.locator('[data-name="expander-icon"]').click();
};

export const toggleRowSelection = async (
  { rowIndex, colIndex }: { rowIndex: number; colIndex?: number },
  { page }: { page: Page },
) => {
  const locator = getCellNodeLocator(
    { rowIndex, colIndex: colIndex || 0 },
    { page },
  );
  await locator.locator('input[type="checkbox"]').click();
};

export const getCellText = async (
  {
    colId,
    colIndex,
    rowIndex,
  }: {
    colId?: string;
    colIndex?: number;
    rowIndex: number;
  },
  { page }: { page: Page },
) => {
  const cell = getCellNodeLocator({ colId, rowIndex, colIndex }, { page });

  return await cell!.evaluate((node) => (node as HTMLElement).innerText);
};

export const getHeaderCellText = async (
  {
    columnId,
  }: {
    columnId: string;
  },
  { page }: { page: Page },
) => {
  const cell = page.locator(
    `[data-name="HeaderCell"][data-column-id="${columnId}"]`,
  );

  return await cell!.evaluate((node) => (node as HTMLElement).innerText);
};

export const getHeaderColumnIds = async ({ page }: { page: Page }) => {
  const cells = await getHeaderColumnCells({ page });

  const result = await Promise.all(
    cells.map((cell: any) =>
      cell.evaluate((node: any) => node.getAttribute('data-column-id')),
    ),
  );

  await Promise.all(
    cells.map(async (cell: ElementHandle<HTMLElement | SVGElement>) => {
      return await cell.dispose();
    }),
  );

  return result;
};

const COL_GROUP_SELECTOR = '[data-group-id]';
export async function getColumnGroupNodes({ page }: { page: Page }) {
  return await page.$$(COL_GROUP_SELECTOR);
}

export async function getColumnGroupNodeForGroup(
  groupId: string,
  { page }: { page: Page },
) {
  return await page.$$eval(
    COL_GROUP_SELECTOR,
    (nodes, groupId) =>
      [...nodes].filter(
        (node) => (node as HTMLElement).dataset.groupId === groupId,
      ),
    groupId,
  );
}
export async function getColumnGroupsIds({ page }: { page: Page }) {
  const elements = await sortElements(page.locator(COL_GROUP_SELECTOR), 'col');

  return await Promise.all(
    elements.map(async (el) => {
      return await el.evaluate((node) => (node as HTMLElement).dataset.groupId);
    }),
  );
}
export async function getColumnGroupsLabels({ page }: { page: Page }) {
  const elements = await sortElements(page.locator(COL_GROUP_SELECTOR), 'col');

  return await Promise.all(
    elements.map(async (el) => {
      return await el.evaluate((node) => (node as HTMLElement).innerText);
    }),
  );
}

export async function getComputedStyleProperty(
  selector: ElementHandle<HTMLElement | SVGElement> | string,
  propertyName: string,
  { page }: { page: Page },
): Promise<string> {
  if (typeof selector === 'string') {
    selector = (await page.$(selector)) as ElementHandle<HTMLElement>;
  }

  const value = await selector.evaluate(
    (node, propertyName) =>
      window.getComputedStyle(node).getPropertyValue(propertyName),
    kebabCase(propertyName),
  );

  return value;
}

const tinycolor = require('tinycolor2');

export const toRGBString = (color: string) => tinycolor(color).toRgbString();
export const toColorString = (color: string) => tinycolor(color).toString();

export const getRowCount = async ({ page }: { page: Page }) => {
  return await page
    .locator('.InfiniteColumnCell[data-row-index][data-col-index="0"]')
    .count();
};
