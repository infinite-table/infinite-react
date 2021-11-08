export const getRowElement = async (rowIndex: number) => {
  const row = await page.$(getRowSelector(rowIndex));

  return row;
};

export const getRowSelector = (rowIndex: number) => {
  return `[data-row-index="${rowIndex}"]`;
};
