export const DevToolsTracks = {
  DataSource: {
    track: 'DataSource',
    labels: {
      RemoteDataLoad: 'Remote data load',
      TreeUnfilteredTreePaths: 'Computing unfiltered tree paths',
      Filter: 'Filter',
      Sort: 'Sort',
      Group: 'Group',
      LazyGroup: 'Lazy group',
      Tree: 'Tree',
      FlattenTree: 'Flatten tree',
      Flatten: 'Flatten groups',
      PrepareData: 'Preparing data',
      ComputeSelectionCount: 'Computing selection count',
      ComputeSelectionCountLazy: 'Computing selection count (lazy)',
      PrepareRowInfo: 'Preparing row info array',
    },
  },
  InfiniteTable: {
    track: 'InfiniteTable',
    labels: {
      Render: 'Rendering',
    },
  },
  MatrixBrain: {
    track: 'Layout Computations',
    labels: {
      ComputeRenderRange: 'Computing render range',
    },
  },
} as const;
