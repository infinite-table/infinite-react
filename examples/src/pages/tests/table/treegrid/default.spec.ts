import { InfiniteTableRowInfo } from '@src/utils/groupAndPivot';
import { test, expect } from '@testing';

export default test.describe('Basic treegrid', () => {
  test('should expand and select nodes correctly', async ({
    page,
    apiModel,
    rowModel,
    treeModel,
  }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toBe(8);

    let rowInfos = await apiModel.evaluateDataSource((api) => {
      return api.getRowInfoArray();
    });

    const initialRowInfos = [
      {
        id: '1',
        nodePath: ['1'],
        totalLeafNodesCount: 5,
        rowSelected: null,
        isTreeNode: true,
        isParentNode: true,
      },
      {
        id: '2',
        nodePath: ['1', '2'],
        totalLeafNodesCount: 0,
        rowSelected: false,

        isTreeNode: true,
        isParentNode: false,
      },
      {
        id: '3',
        nodePath: ['1', '3'],
        totalLeafNodesCount: 0,
        rowSelected: true,
        isTreeNode: true,
        isParentNode: false,
      },
      {
        id: '4',
        nodePath: ['1', '4'],
        totalLeafNodesCount: 2,
        rowSelected: null,
        isTreeNode: true,
        isParentNode: true,
      },
      {
        id: '5',
        nodePath: ['1', '4', '5'],
        totalLeafNodesCount: 0,
        rowSelected: true,
        isTreeNode: true,
        isParentNode: false,
      },
      {
        id: '6',
        nodePath: ['1', '4', '6'],
        totalLeafNodesCount: 0,
        rowSelected: false,
        isTreeNode: true,
        isParentNode: false,
      },
      {
        id: '7',
        nodePath: ['1', '7'],
        totalLeafNodesCount: 0,
        rowSelected: false,
        isTreeNode: true,
        isParentNode: false,
      },
      {},
    ];
    expect(rowInfos).toMatchObject(initialRowInfos);

    // toggle the selection of the second child in "pictures" folder
    // thus making all the children in this folderselected
    await treeModel.toggleNodeSelection(5);

    rowInfos = await apiModel.evaluateDataSource((api) => {
      return api.getRowInfoArray();
    });

    // so we expect the selection to have been updated
    initialRowInfos[3].rowSelected = true;
    initialRowInfos[5].rowSelected = true;

    expect(rowInfos).toMatchObject(initialRowInfos);

    await treeModel.toggleParentNode(7);
    await treeModel.toggleNodeSelection(7);

    rowInfos = await apiModel.evaluateDataSource((api) => {
      return api.getRowInfoArray();
    });

    expect(rowInfos.length).toBe(initialRowInfos.length + 2);

    expect(rowInfos[7].rowSelected).toBe(true);
    expect(rowInfos[8].rowSelected).toBe(true);
    expect(rowInfos[9].rowSelected).toBe(true);
  });

  test('header selection should work', async ({
    page,
    treeModel,
    apiModel,
    headerModel,
  }) => {
    await page.waitForInfinite();

    await treeModel.toggleNodeSelection(0);
    await treeModel.toggleNodeSelection(7);

    let rowInfos = await apiModel.evaluateDataSource((api) => {
      return api.getRowInfoArray();
    });

    expect(
      rowInfos.reduce(
        (acc: boolean, rowInfo: InfiniteTableRowInfo<any>) =>
          acc && rowInfo.rowSelected === true,
        true,
      ),
    ).toBe(true);

    await headerModel.clickSelectionCheckbox('name');

    rowInfos = await apiModel.evaluateDataSource((api) => {
      return api.getRowInfoArray();
    });

    expect(
      rowInfos.reduce(
        (acc: boolean, rowInfo: InfiniteTableRowInfo<any>) =>
          acc || rowInfo.rowSelected !== false,
        false,
      ),
    ).toBe(false);
  });
});
