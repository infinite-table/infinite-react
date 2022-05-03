import { InfiniteTableRowInfo } from '../../../utils/groupAndPivot';

export const showLoadingIcon = (
  rowInfo: InfiniteTableRowInfo<any>,
): boolean => {
  // display loading indicator when row data is not yet available
  // if (rowInfo?.data == undefined) {
  //   return true;
  // }

  if (rowInfo.dataSourceHasGrouping) {
    return rowInfo.isGroupRow
      ? rowInfo.childrenLoading || !rowInfo.selfLoaded
      : !rowInfo.selfLoaded;
  }

  // // display loading indicator when row is loading group(children rows) data
  return !rowInfo.selfLoaded;
};
