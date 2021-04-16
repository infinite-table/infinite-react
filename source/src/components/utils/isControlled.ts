import isControlledValue from './isControlledValue';

function isControlled<V extends keyof T, T>(propName: V, props: T): boolean {
  const propValue = props[propName];

  const controlled: boolean = isControlledValue(propValue);

  return controlled;
}

export default isControlled;
