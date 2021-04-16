import { ElementHandle } from 'puppeteer';
import { sortElements } from './listUtils';

export const wait = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
};
export const getHeaderCellByColumnId = async (columnId: string) => {
  return await page.$(`.ITableHeader [data-column-id="${columnId}"]`);
};

export const getHeaderColumnCells = async () => {
  const cells = await page.$$(`.ITableHeader [data-name="Cell"]`);

  const result = await sortElements(cells);

  return result;
};

export const getColumnCells = async (columnName: string) => {
  const [headerCell, ...bodyCells] = await page.$$(
    `[data-column-id="${columnName}"]`,
  );

  const cells = await sortElements(bodyCells);

  return {
    headerCell,
    bodyCells: cells,
  };
};

export const getHeaderColumnIds = async () => {
  let cells = await getHeaderColumnCells();

  const result = Promise.all(
    cells.map((cell: any) =>
      cell.evaluate((node: any) => node.getAttribute('data-column-id')),
    ),
  );

  await Promise.all(
    cells.map(async (cell: ElementHandle) => {
      return await cell.dispose();
    }),
  );

  return result;
};
