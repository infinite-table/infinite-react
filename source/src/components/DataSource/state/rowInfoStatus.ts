import { InfiniteTableRowInfo } from '../../../utils/groupAndPivot';

export const showLoadingIcon = (
  _rowInfo: InfiniteTableRowInfo<any>,
): boolean => {
  // display loading indicator when row data is not yet available
  // if (rowInfo?.data == undefined) {
  //   return true;
  // }

  if (_rowInfo.dataSourceHasGrouping) {
    return _rowInfo.isGroupRow
      ? _rowInfo.childrenLoading || !_rowInfo.selfLoaded
      : !_rowInfo.selfLoaded;
  }

  // // display loading indicator when row is loading group(children rows) data
  // if (rowInfo?.loadingGroupData) {
  //   return true;
  // }

  return false;
};
