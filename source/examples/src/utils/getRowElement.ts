export const getRowElement = async (rowIndex: number) => {
  const row = await page.$(`[data-row-index="${rowIndex}"]`);

  return row;
};
