import { SORT_ASC } from './IBrain';

export function slowerGetGreatestCountFittingInSize(
  availableSize: number,
  itemSizes: number[],
) {
  const len = itemSizes.length;

  let maxCount = -1;

  itemSizes.sort(SORT_ASC);
  let sum = 0;
  for (let i = 0; i < len; i++) {
    sum += itemSizes[i];

    maxCount++;
    if (sum > availableSize) {
      break;
    }
  }
  return maxCount + 1;
}

/**
 * I can have an available size of 100 and an array of [80,10,30,90,10,20,10,11,60, 40] and
 * the matching array segment is 20,10,11,60 because that's > 100 but also other segments,
 * like 80,10,30 are smaller in size.
 *
 * @param availableSize - The available size.
 * @param itemSizes - The sizes of the items.
 * @returns The greatest consecutive count of items that can fit in the available size.
 */

export function getGreatestCountVisibleInSize(
  availableSize: number,
  itemSizes: number[],
) {
  const len = itemSizes.length;
  if (!len) {
    return 0;
  }

  let maxCount = -1;

  for (let start = 0; start < len; start++) {
    let sum = 0;
    let count = 0;

    if (len - start <= maxCount) {
      // leave early if we already have a sequence
      // that's longer then the length of the possible
      // remaining sequences
      break;
    }

    for (let i = start; i < len; i++) {
      sum += itemSizes[i];
      count++;

      if (sum > availableSize) {
        if (count > maxCount) {
          maxCount = count;
        }
        break;
      }
    }
  }

  /**
   * there's this edge case:
   * availableSize: 200,
   * itemSizes: [200,10,230,200,210,10,300]
   *
   * the maxCount should be 2
   * but when we scroll past the second column and the render range
   * is [2,5] (so from col 2 to col 5 exclusively, meaning cols 2,3,4 are rendered
   * since the MatrixBrain algo added an extra 1 to it)
   * when we scroll back from scrollLeft: 211px to 210px and 209px
   * we see a flicker of the second col (col 1) being rendered
   *
   */
  return maxCount < 0 ? len : Math.min(maxCount, len);
}
