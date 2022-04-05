import React from 'react';
import DataGrid, {
  Column,
  GroupPanel,
  Scrolling,
} from 'devextreme-react/data-grid';

import { columns } from './columns';

const url =
  process.env.NEXT_PUBLIC_BASE_URL + '/developers10k';

let groupIndex = 0;

class App extends React.Component {
  render() {
    return (
      <DataGrid
        allowColumnResizing
        allowColumnReordering
        style={{ height: 600, maxHeight: '100vh' }}
        dataSource={url}
        keyExpr="id"
        showBorders={true}
        columnWidth={100}>
        <GroupPanel />
        <Scrolling
          mode="virtual"
          columnRenderingMode="virtual"
        />
        {columns.map((column, index) => {
          const columnProps: React.ComponentProps<
            typeof Column
          > = {
            dataField: column.field,
            calculateCellValue: column.getValue,
            caption: column.header,
          };

          if (column.group) {
            columnProps.groupIndex = groupIndex;
            groupIndex += 1;
          }

          return <Column key={index} {...columnProps} />;
        })}
      </DataGrid>
    );
  }
}

export default App;
