import * as React from 'react';
import { useDataSourceInternal } from '../DataSource/privateHooks/useDataSource';
import { TreeDataSourceProps } from './types/TreeDataSourceProps';

function TreeDataSource<T>(props: TreeDataSourceProps<T>) {
  const { DataSource: DataSourceComponent } = useDataSourceInternal<
    T,
    TreeDataSourceProps<T>
  >(props);

  return (
    <DataSourceComponent nodesKey={props.nodesKey || 'nodes'}>
      {props.children ?? null}
    </DataSourceComponent>
  );
}

export { TreeDataSource };
