const rule = (name: string, value: string) => `it__${name}=${value}`;

export const ICSS = {
  variables: {
    space: [
      '--it-space-0',
      '--it-space-1',
      '--it-space-2',
      '--it-space-3',
      '--it-space-4',
      '--it-space-5',
      '--it-space-6',
      '--it-space-7',
      '--it-space-8',
      '--it-space-9',
      '--it-space-10',
    ] as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ],
    borderRadius: '--it__border-radius',
    fontSize: [
      '--it-font-size-0',
      '--it-font-size-1',
      '--it-font-size-2',
      '--it-font-size-3',
      '--it-font-size-4',
      '--it-font-size-5',
      '--it-font-size-6',
      '--it-font-size-7',
    ] as [string, string, string, string, string, string, string, string],
  },
  alignItems: {
    center: rule('align-items', 'center'),
  },
  justifyContent: {
    center: rule('justify-content', 'center'),
    'flex-start': rule('justify-content', 'flex-start'),
    flexStart: rule('justify-content', 'flex-start'),
    'flex-end': rule('justify-content', 'flex-end'),
    flexEnd: rule('justify-content', 'flex-end'),
  },
  overflow: {
    hidden: rule('overflow', 'hidden'),
    visible: rule('overflow', 'visible'),
    auto: rule('overflow', 'auto'),
  },
  overflowX: {
    hidden: rule('overflow-x', 'hidden'),
    visible: rule('overflow-x', 'visible'),
    auto: rule('overflow-x', 'auto'),
  },
  overflowY: {
    hidden: rule('overflow-y', 'hidden'),
    visible: rule('overflow-y', 'visible'),
    auto: rule('overflow-y', 'auto'),
  },
  cursor: {
    pointer: rule('cursor', 'pointer'),
  },
  height: {
    0: rule('height', '0'),
    '100%': rule('height', '100%'),
  },
  width: {
    0: rule('width', '0'),
    '100%': rule('width', '100%'),
  },
  top: {
    0: rule('top', '0'),
    '100%': rule('top', '100%'),
  },
  left: {
    0: rule('left', '0'),
    '100%': rule('left', '100%'),
  },
  transform: {
    translate3D000: rule('transform', 'translate3D000'),
  },
  willChange: {
    transform: rule('will-change', 'transform'),
  },
  position: {
    relative: rule('position', 'relative'),
    absolute: rule('position', 'absolute'),
    fixed: rule('position', 'fixed'),
  },
  display: {
    flex: rule('display', 'flex'),
  },
  flexFlow: {
    row: rule('flex-flow', 'row'),
  },
  whiteSpace: {
    nowrap: rule('white-space', 'nowrap'),
  },
  textOverflow: {
    ellipsis: rule('text-overflow', 'ellipsis'),
  },
  userSelect: {
    none: rule('user-select', 'none'),
  },
};
