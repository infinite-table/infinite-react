import { InfiniteTableRowInfo } from '../../../utils/groupAndPivot';

export const showLoadingIcon = (
  rowInfo: InfiniteTableRowInfo<any>,
): boolean => {
  // display loading indicator when row data is not yet available
  if (rowInfo?.data == undefined) {
    return true;
  }

  // display loading indicator when row is loading group(children rows) data
  if (rowInfo?.loadingGroupData) {
    return true;
  }

  return false;
};
