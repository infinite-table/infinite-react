import { RefObject } from 'react';

import { InfiniteTableComputedColumn } from '../../../types';
import {
  setInfiniteColumnOffset,
  setInfiniteColumnWidth,
} from '../../../utils/infiniteDOMUtils';

export function getResizer<T>(
  colIndex: number,
  {
    columns,
    shareSpaceOnResize,
    domRef,
  }: {
    columns: InfiniteTableComputedColumn<T>[];
    shareSpaceOnResize: boolean;
    domRef: RefObject<HTMLDivElement>;
  },
) {
  const column = columns[colIndex];

  return {
    resize(diff: number) {
      setInfiniteColumnWidth(
        colIndex,
        column.computedWidth + diff,
        domRef.current,
      );

      if (shareSpaceOnResize) {
        setInfiniteColumnWidth(
          colIndex + 1,
          columns[colIndex + 1]?.computedWidth - diff,
          domRef.current,
        );
        setInfiniteColumnOffset(
          colIndex + 1,
          columns[colIndex + 1]?.computedOffset + diff,
          domRef.current,
        );
        return;
      }
      for (let i = colIndex + 1; i < columns.length; i++) {
        setInfiniteColumnOffset(
          i,
          columns[i].computedOffset + diff,
          domRef.current,
        );
      }
    },
  };
}

// export function getGroupResizer<T>(
//   colIndexes: number[],
//   {
//     columns,
//     shareSpaceOnResize,
//     domRef,
//   }: {
//     columns: InfiniteTableComputedColumn<T>[];
//     shareSpaceOnResize: boolean;
//     domRef: RefObject<HTMLDivElement>;
//   },
// ) {
//   return {
//     resize(diff: number) {
//       colIndexes.forEach((colIndex) => {
//         const column = columns[colIndex];
//         setInfiniteColumnWidth(
//           colIndex,
//           column.computedWidth + diff,
//           domRef.current,
//         );
//       });

//       const lastColIndex = colIndexes[colIndexes.length - 1];
//       if (shareSpaceOnResize) {
//         setInfiniteColumnWidth(
//           lastColIndex + 1,
//           columns[lastColIndex + 1]?.computedWidth - diff,
//           domRef.current,
//         );
//         setInfiniteColumnOffset(
//           lastColIndex + 1,
//           columns[lastColIndex + 1]?.computedOffset + diff,
//           domRef.current,
//         );
//         return;
//       }
//       for (let i = lastColIndex + 1; i < columns.length; i++) {
//         setInfiniteColumnOffset(
//           i,
//           columns[i].computedOffset + diff,
//           domRef.current,
//         );
//       }
//     },
//   };
// }
