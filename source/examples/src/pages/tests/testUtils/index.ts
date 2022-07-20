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

const resizeHandle = async (diff: number, handle: Locator, page: Page) => {
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + diff, 0);
  await page.mouse.up();
};

export const resizeColumnById = async (
  columnId: string,
  diff: number,
  { page }: { page: Page },
) => {
  const colHeaderCell = getHeaderCellByColumnId(columnId, { page });

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

export const getValuesByColumnId = async (
  columnId: string,
  { page }: { page: Page },
) => {
  const { bodyCells } = await getColumnCells(columnId, {
    page,
  });

  const values = await Promise.all(
    bodyCells.map(
      async (cell: ElementHandle) =>
        await cell.evaluate((node) => node.textContent),
    ),
  );

  return values;
};

export const getHeaderCellByColumnId = (
  columnId: string,
  { page }: { page: Page },
) => {
  return page.locator(`.InfiniteHeader [data-column-id="${columnId}"]`);
};

export const getHeaderCellByIndex = (
  colIndex: number,
  { page }: { page: Page },
) => {
  return page.locator(`.InfiniteHeader [data-col-index="${colIndex}"]`).last();
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
  {
    columnId,
    rowIndex,
    colIndex,
  }: { columnId?: string; colIndex?: number; rowIndex: number },
  { page }: { page: Page },
) => {
  const colSelector = columnId
    ? `[data-column-id="${columnId}"]`
    : `[data-col-index="${colIndex}"]`;
  return page.locator(
    `.InfiniteColumnCell[data-row-index="${rowIndex}"]${colSelector}`,
  );
};

export const getFirstChild = (locator: Locator) => {
  return locator.locator(':first-child').first();
};

export const getHeaderCellWidthByColumnId = async (
  columnId: string,
  { page }: { page: Page },
): Promise<number> => {
  const node = getHeaderCellByColumnId(columnId, { page });

  const value = await node!.evaluate(
    (node) => node.getBoundingClientRect().width,
  );
  return value;
};

export const getColumnWidths = async (
  colIds: string[],
  { page }: { page: Page },
) => {
  return await Promise.all(
    colIds.map(async (id) => {
      return await getHeaderCellWidthByColumnId(id, { page });
    }),
  );
};

export const getColumnOffsetById = async (
  columnId: string,
  { page }: { page: Page },
) => {
  const node = getHeaderCellByColumnId(columnId, { page });

  const value = await node!.evaluate((node) => {
    const matrix = getComputedStyle(node).transform;
    const translatex = matrix.slice('.matrix('.length, -1).split(',')[4];

    return parseInt(translatex);
  });
  return value;
};

export const getColumnIdByIndex = async (
  colIndex: number,
  { page }: { page: Page },
) => {
  const node = getHeaderCellByIndex(colIndex, { page });

  return await node.getAttribute('data-column-id');
};

export const getHeaderColumnCells = async ({ page }: { page: Page }) => {
  const cells = page.locator(`.InfiniteHeader [data-column-id]`);

  const result = await sortElements(cells, 'col');

  return result;
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
    const [xVar, yVar] = node.style.transform
      .split('translate3d(')[1]
      .split(',')
      .map((x) => x.trim());

    function stripVar(cssVariableWithVarString: string) {
      return cssVariableWithVarString.slice(4, -1);
    }
    return [
      getComputedStyle(node).getPropertyValue(stripVar(xVar)),
      getComputedStyle(node).getPropertyValue(stripVar(yVar)),
    ];
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

export const getColumnCells = async (
  columnName: string,
  { page }: { page: Page },
) => {
  const headerCell = page.locator(
    `.InfiniteHeader [data-column-id="${columnName}"]`,
  );

  const bodyCells = await page.locator(
    `.InfiniteColumnCell[data-column-id="${columnName}"]`,
  );

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

export const getCellText = async (
  {
    columnId,
    rowIndex,
  }: {
    columnId: string;
    rowIndex: number;
  },
  { page }: { page: Page },
) => {
  const cell = page.locator(
    `.InfiniteBody [data-row-index="${rowIndex}"][data-column-id="${columnId}"]`,
  );

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
  return await page.$$eval(COL_GROUP_SELECTOR, (nodes) =>
    [...nodes].map((node) => (node as HTMLElement).dataset.groupId),
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
