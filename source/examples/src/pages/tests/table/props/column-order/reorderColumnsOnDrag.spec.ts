// import { reorderColumnsOnDrag } from '@infinite-table/infinite-react/components/InfiniteTable/hooks/reorderColumnsOnDrag';
// import {
//   InfiniteTableComputedColumn,
//   InfiniteTableImperativeApi,
// } from '@infinite-table/infinite-react/components/InfiniteTable/types';
// import { MatrixBrain } from '@infinite-table/infinite-react/components/VirtualBrain/MatrixBrain';
// import { test } from '@testing';

// export default test.describe.parallel('Reorder columns', () => {
//   test.skip('should work fine on scroll', () => {
//     const brain = new MatrixBrain();

//     const computedVisibleColumns: InfiniteTableComputedColumn<any>[] = [
//       { computedOffset: 0, computedWidth: 100, id: 'one' },
//       { computedOffset: 100, computedWidth: 50, id: 'two' },
//       { computedOffset: 150, computedWidth: 300, id: 'three' },
//       { computedOffset: 450, computedWidth: 150, id: 'four' },
//     ] as any as InfiniteTableComputedColumn<any>[];

//     const dragger = reorderColumnsOnDrag<any>({
//       columnOffsetAtIndexCSSVar: 'colOffset',
//       columnWidthAtIndexCSSVar: 'colWidth',
//       computedVisibleColumns: computedVisibleColumns,
//       computedPinnedEndColumns: [],
//       computedPinnedStartColumns: [],
//       computedVisibleColumnsMap: new Map<
//         string,
//         InfiniteTableComputedColumn<any>
//       >(),
//       brain,
//       dragColumnId: 'two',
//       infiniteDOMNode: {} as any as HTMLElement,
//       computedUnpinnedColumns: computedVisibleColumns,
//       imperativeApi: {} as any as InfiniteTableImperativeApi<any>,
//       dragColumnHeaderTargetRect: {
//         // left: 0,
//       } as any as DOMRect,
//       initialMousePosition: {
//         clientX: 0,
//         clientY: 0,
//       },
//       setProxyPosition: (pos: { top: number; left: number } | null) => {},
//       tableRect: {} as any as DOMRect,
//     });

//     const indexes = dragger.onMove({
//       clientX: 100,
//       clientY: 0,
//     });

//     expect(indexes).toEqual([]);
//   });
// });

export default {};
