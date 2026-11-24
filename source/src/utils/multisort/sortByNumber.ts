/**
 * Arrays shorter than this are left to the comparator sort: there is nothing
 * measurable to gain (well under a millisecond).
 */
export const SORT_BY_NUMBER_MIN_LENGTH = 1_000;

const IS_LITTLE_ENDIAN = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

/**
 * Sorts the array in place by a numeric value of each item, giving the same
 * order as `array.sort((a, b) => dir * (getValue(a) - getValue(b)))` - a stable
 * sort, so items with equal values keep their order, in both directions.
 *
 * It does so without calling a comparator: the values are copied to a typed
 * array and a radix sort computes the order, in linear time. Measured in
 * Chromium 136: 10,000 items in 0.3ms instead of 5ms, 1,000,000 items in 40ms
 * instead of more than a second. The very first call on a page (code not
 * optimized yet) takes about as long as the comparator sort up to 10,000
 * items, and less above that.
 *
 * Returns false, with the array untouched, when a value is not a number (or
 * is NaN) - subtracting those in a comparator has its own semantics (null is
 * 0, "5" is 5, NaN and undefined compare as equal to anything), which the
 * caller's comparator sort keeps.
 */
export function sortByNumber<T>(
  array: T[],
  getValue: (item: T) => any,
  dir: 1 | -1,
): boolean {
  const len = array.length;
  const keys = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const value = getValue(array[i]);
    if (typeof value !== 'number' || value !== value) {
      return false;
    }
    // adding 0 turns -0 into 0, as the two are equal for a comparator
    keys[i] = (dir < 0 ? -value : value) + 0;
  }

  if (len < 2) {
    return true;
  }

  // the bits of each float64, as two uint32 words
  const words = new Uint32Array(keys.buffer);
  const LOW = IS_LITTLE_ENDIAN ? 0 : 1;
  const HIGH = IS_LITTLE_ENDIAN ? 1 : 0;

  // The sort works with 8-bit digits, so 8 of them per value. Bigger digits
  // need fewer passes, but have a fixed cost (the size of the counts) that
  // makes small arrays slower to sort than with a comparator.
  //
  // One pass over the values makes them sortable and counts the digits:
  // counts[digitIndex * 256 + digit] = the number of values with that digit
  const counts = new Uint32Array(8 * 256);

  for (let i = 0; i < len; i++) {
    let low = words[2 * i + LOW];
    let high = words[2 * i + HIGH];

    // make the bits of the floats sort like unsigned integers: flip the sign
    // bit of positive numbers, and all the bits of negative ones
    if (high & 0x80000000) {
      high = ~high >>> 0;
      low = ~low >>> 0;
      words[2 * i + LOW] = low;
    } else {
      high = (high | 0x80000000) >>> 0;
    }
    words[2 * i + HIGH] = high;

    counts[low & 0xff]++;
    counts[256 + ((low >>> 8) & 0xff)]++;
    counts[512 + ((low >>> 16) & 0xff)]++;
    counts[768 + (low >>> 24)]++;
    counts[1024 + (high & 0xff)]++;
    counts[1280 + ((high >>> 8) & 0xff)]++;
    counts[1536 + ((high >>> 16) & 0xff)]++;
    counts[1792 + (high >>> 24)]++;
  }

  // least significant digit radix sort of the item indexes
  let indexes = new Uint32Array(len);
  let nextIndexes = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    indexes[i] = i;
  }

  for (let digitIndex = 0; digitIndex < 8; digitIndex++) {
    const word = digitIndex < 4 ? LOW : HIGH;
    const shift = (digitIndex % 4) * 8;
    const countsOffset = digitIndex * 256;

    if (counts[countsOffset + ((words[word] >>> shift) & 0xff)] === len) {
      // all the values have the same digit here, so this pass would not move
      // anything (e.g. the low bits of integers are all zero)
      continue;
    }

    // turn the counts into the position of the first item with each digit
    let position = 0;
    for (let digit = 0; digit < 256; digit++) {
      const count = counts[countsOffset + digit];
      counts[countsOffset + digit] = position;
      position += count;
    }

    for (let i = 0; i < len; i++) {
      const index = indexes[i];
      const digit = (words[2 * index + word] >>> shift) & 0xff;
      nextIndexes[counts[countsOffset + digit]++] = index;
    }

    const previousIndexes = indexes;
    indexes = nextIndexes;
    nextIndexes = previousIndexes;
  }

  const items = array.slice();
  for (let i = 0; i < len; i++) {
    array[i] = items[indexes[i]];
  }

  return true;
}
