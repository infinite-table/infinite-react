import { style, styleVariants } from '@vanilla-extract/css';

export const cellStyle = style({
  display: 'flex',
  flexFlow: 'row',
  alignItems: 'center',
});

export const columnAlignCellStyle = styleVariants({
  center: { justifyContent: 'center' },
  start: { justifyContent: 'flex-start' },
  end: { justifyContent: 'flex-end' },
});
