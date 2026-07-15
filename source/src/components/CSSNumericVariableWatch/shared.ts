import { CSSProperties } from '@vanilla-extract/css';
import { dbg, err } from '../../utils/debugLoggers';

export const error = err('CSSVariableWatch');
export const debug = dbg('CSSVariableWatch');

export const WRAPPER_STYLE: CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  width: '0px',
  height: '0px',
  lineHeight: 0,
  fontSize: 0,
  overflow: 'hidden',
};
