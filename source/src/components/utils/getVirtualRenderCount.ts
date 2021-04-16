type Options = {
  size: { width: number; height: number };
  mainAxis: 'horizontal' | 'vertical';
  itemMainAxisSize: number | ((itemIndex: number) => number);
  itemMainAxisMinSize: number;
};
export const getVirtualRenderCount = (options: Options) => {
  const { size, mainAxis, itemMainAxisSize, itemMainAxisMinSize } = options;

  const renderSize = Math.round(
    mainAxis === 'vertical' ? size.height : size.width,
  );
  let itemSize =
    typeof itemMainAxisSize !== 'function'
      ? itemMainAxisSize
      : itemMainAxisMinSize;

  const renderCount = Math.ceil(renderSize / itemSize) + 1;

  return renderCount;
};
