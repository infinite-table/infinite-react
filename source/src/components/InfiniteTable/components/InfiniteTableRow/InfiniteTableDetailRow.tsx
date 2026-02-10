import * as React from 'react';
import { RowDetailCache } from '../../../../components/DataSource';
import { join } from '../../../../utils/join';

import { internalProps } from '../../internalProps';
import { InternalVars } from '../../internalVars.css';
import { InfiniteTableProps, InfiniteTableRowInfo } from '../../types';
import { RowDetailRecipe } from '../rowDetail.css';

import {
  getDataSourceMasterDetailContext,
  getDataSourceMasterDetailStoreContext,
} from '../../../../components/DataSource/DataSourceMasterDetailContext';

import { NonUndefined } from '../../../types/NonUndefined';
import { useRegisterDetail } from './useRegisterDetail';
import { createDataSourceMasterDetailStore } from '../../../DataSource/DataSourceMasterDetailStore';

type InfiniteTableDetailRowProps<T> = {
  rowInfo: InfiniteTableRowInfo<T>;
  rowIndex: number;
  domRef?: React.RefCallback<HTMLElement>;
  rowDetailHeight: number;
  detailOffset: number;
  rowDetailRenderer: NonUndefined<InfiniteTableProps<T>['rowDetailRenderer']>;
  rowDetailsCache: RowDetailCache;
};

const { rootClassName } = internalProps;

export const InfiniteTableRowDetailsClassName = `${rootClassName}RowDetail`;

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

  const DataSourceMasterDetailStoreContext =
    getDataSourceMasterDetailStoreContext<T>();

  const [masterDetailStore] = React.useState(() =>
    createDataSourceMasterDetailStore<T>(),
  );

  masterDetailStore.setSnapshot(masterDetailContextValue);

  React.useLayoutEffect(() => {
    masterDetailStore.notify();
  }, [masterDetailContextValue]);

  return (
    <DataSourceMasterDetailStoreContext.Provider value={masterDetailStore}>
      <DataSourceMasterDetailContext.Provider value={masterDetailContextValue}>
        <div
          ref={domRef}
          className={join(
            InfiniteTableRowDetailsClassName,
            RowDetailRecipe({}),
          )}
          style={{
            position: 'absolute',
            top: `${detailOffset}px`,
            left: 0,
            // TODO see #rowDetailWidth
            width: `calc(${InternalVars.bodyWidth} - ${InternalVars.scrollbarWidthVertical})`,
            height: rowDetailHeight,
          }}
        >
          {rowDetailRenderer(rowInfo, currentRowCache)}
        </div>
      </DataSourceMasterDetailContext.Provider>
    </DataSourceMasterDetailStoreContext.Provider>
  );
}

export const InfiniteTableDetailRow = React.memo(
  InfiniteTableDetailRowFn,
) as typeof InfiniteTableDetailRowFn;
