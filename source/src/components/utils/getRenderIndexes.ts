export const getRenderIndexes = (info: {
  count: number;
  renderStartIndex: number;
  renderCount: number;
}) => {
  let { count, renderStartIndex, renderCount } = info;

  renderCount = Math.min(renderCount, count);

  const renderEndIndex = Math.max(
    -1,
    Math.min(renderStartIndex + renderCount - 1, count - 1),
  );

  if (renderStartIndex >= renderEndIndex) {
    if (renderEndIndex + 1 - renderCount >= 0) {
      renderStartIndex = renderEndIndex + 1 - renderCount;
    }
  }

  if (renderEndIndex < 0 || renderStartIndex < 0) {
    return null;
  }

  const result = {
    renderStartIndex,
    renderEndIndex,
    renderCount,
    count,
  };

  return result;
};
