import { Page } from '@playwright/test';

export const getRowObject = async (
  rowIndex: number,
  { page }: { page: Page },
) => {
  const cells = await page.locator(
    `.InfiniteColumnCell[data-row-index="${rowIndex}"]`,
  );

  return await cells.evaluateAll((nodes) => {
    return (nodes as HTMLElement[]).reduce(
      (acc: Record<string, string>, node: HTMLElement) => {
        const colId = node.dataset.columnId as string;

        acc[colId] = node.innerText;
        return acc;
      },
      {},
    );
  });
};
