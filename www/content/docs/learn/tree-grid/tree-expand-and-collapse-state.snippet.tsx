// Snippets shown on tree-expand-and-collapse-state.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

{
  //#region example-of-treeexpandstate-with-node-paths
  const treeExpandState = {
    defaultExpanded: true,
    collapsedPaths: [
      ['1', '10'],
      ['2', '20'],
      ['5']
    ],
    expandedPaths: [
      ['1', '4'],
      ['5','nested node in 5'],
    ],
  };
  //#endregion
}

{
  //#region example-of-treeexpandstate-with-node-ids
  const treeExpandState = {
    defaultExpanded: true,
    collapsedIds: ['1', '2', '5'],
    expandedIds: ['10', '20', 'nested node in 5'],
  };
  //#endregion
}

export {};
