import * as React from 'react';
import { InfiniteTableColumn } from '..';
import { DataSourceGroupBy } from '../../DataSource';

export function getColumnForGroupBy<T>(
  groupBy: DataSourceGroupBy<T>,
): InfiniteTableColumn<T> {
  return {
    render: ({ value, enhancedData }) => {
      return (
        <div
          style={{
            paddingLeft:
              ((enhancedData.groupNesting || 0) +
                (enhancedData.isGroupRow ? 0 : 1)) *
              30,
          }}
        >
          {enhancedData.groupKeys
            ? enhancedData.groupKeys.join(' >> ')
            : value ?? null}
        </div>
      );
    },
  };
}
