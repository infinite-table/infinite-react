import { style } from '@vanilla-extract/css';
import { flex, position, transformTranslateZero } from '../../utilities.css';

export const InfiniteBodyCls = style([
  position.relative,
  flex['1'],
  transformTranslateZero,
]);
