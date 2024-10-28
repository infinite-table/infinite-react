import * as React from 'react';
import { toTreeDataArray } from '../../utils/groupAndPivot/treeUtils';
import { useDataSourceInternal } from '../DataSource/privateHooks/useDataSource';
import { TreeDataSourceProps } from './types/TreeDataSourceProps';

function TreeDataSource<T>(props: TreeDataSourceProps<T>) {
  const { DataSource: DataSourceComponent } = useDataSourceInternal<
    T,
    TreeDataSourceProps<T>
  >({ nodesKey: 'children', ...props });

  return <DataSourceComponent>{props.children ?? null}</DataSourceComponent>;
}

export { TreeDataSource };

export { toTreeDataArray };
