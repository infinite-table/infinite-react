const DEFAULT_ReversedPolynomial = 0xedb88320;

/*
 * CRC-32 implementation
 */

function crc32_generate(reversedPolynomial = DEFAULT_ReversedPolynomial) {
  var table = new Array();
  var i, j, n;

  for (i = 0; i < 256; i++) {
    n = i;
    for (j = 8; j > 0; j--) {
      if ((n & 1) == 1) {
        n = (n >>> 1) ^ reversedPolynomial;
      } else {
        n = n >>> 1;
      }
    }
    table[i] = n;
  }

  return table;
}

function crc32_initial() {
  return 0xffffffff;
}

function crc32_add_byte(table: number[], crc: number, byte: number) {
  crc = (crc >>> 8) ^ table[byte ^ (crc & 0x000000ff)];
  return crc;
}

function crc32_final(crc: number) {
  crc = ~crc;
  crc = crc < 0 ? 0xffffffff + crc + 1 : crc;
  return crc;
}

export function crc32_compute_string(
  str: string,
  reversedPolynomial = DEFAULT_ReversedPolynomial,
): string {
  var table = crc32_generate(reversedPolynomial);
  var crc = 0;
  var i;

  crc = crc32_initial();

  for (i = 0; i < str.length; i++)
    crc = crc32_add_byte(table, crc, str.charCodeAt(i));

  crc = crc32_final(crc);
  return `${crc}`;
}
