import * as React from 'react';
import { RowDetailsCache } from '../../../../components/DataSource';
import { join } from '../../../../utils/join';

import { internalProps } from '../../internalProps';
import { InternalVars } from '../../theme.css';
import { InfiniteTableProps, InfiniteTableRowInfo } from '../../types';
import { RowDetailsRecipe } from '../rowDetails.css';

import { getDataSourceMasterDetailContext } from '../../../../components/DataSource/DataSourceMasterDetailContext';

import { NonUndefined } from '../../../types/NonUndefined';
import { useRegisterDetail } from './useRegisterDetail';

type InfiniteTableDetailRowProps<T> = {
  rowInfo: InfiniteTableRowInfo<T>;
  rowIndex: number;
  domRef?: React.RefCallback<HTMLElement>;
  rowDetailHeight: number;
  detailOffset: number;
  rowDetailRenderer: NonUndefined<InfiniteTableProps<T>['rowDetailRenderer']>;
  rowDetailsCache: RowDetailsCache;
};

const { rootClassName } = internalProps;

export const InfiniteTableRowDetailsClassName = `${rootClassName}ColumnCell`;

function InfiniteTableDetailRowFn<T>(props: InfiniteTableDetailRowProps<T>) {
  const DataSourceMasterDetailContext = getDataSourceMasterDetailContext();
  const {
    domRef,
    rowDetailRenderer,
    rowDetailHeight,
    rowInfo,
    detailOffset,
    rowDetailsCache,
  } = props;

  const { masterDetailContextValue, currentRowCache } = useRegisterDetail<T>({
    rowDetailsCache,
    rowInfo,
  });

  return (
    <DataSourceMasterDetailContext.Provider value={masterDetailContextValue}>
      <div
        ref={domRef}
        className={join(InfiniteTableRowDetailsClassName, RowDetailsRecipe({}))}
        style={{
          position: 'absolute',
          top: `${detailOffset}px`,
          left: 0,
          width: `calc(${InternalVars.bodyWidth} - ${InternalVars.scrollbarWidthVertical})`,
          height: rowDetailHeight,
        }}
      >
        {rowDetailRenderer(rowInfo, currentRowCache)}
      </div>
    </DataSourceMasterDetailContext.Provider>
  );
}

export const InfiniteTableDetailRow = React.memo(
  InfiniteTableDetailRowFn,
) as typeof InfiniteTableDetailRowFn;