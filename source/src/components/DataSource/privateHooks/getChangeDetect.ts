import { getGlobal } from '../../../utils/getGlobal';

export function getChangeDetect() {
  const perfNow = getGlobal().performance?.now();

  return `${Date.now()}:${perfNow}`;
}
