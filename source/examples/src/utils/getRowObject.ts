export const getRowObject = async (rowIndex: number) => {
  const row = await page.$(`[data-row-index="${rowIndex}"]`);

  const result = await row.$$eval(
    '[data-name="Cell"]',
    (cells: HTMLElement[]) =>
      cells.reduce((acc: Record<string, string>, cell) => {
        acc[cell.getAttribute('data-column-id') as string] = cell.innerText;
        return acc;
      }, {}),
  );

  return result;
};
export default getRowObject;
