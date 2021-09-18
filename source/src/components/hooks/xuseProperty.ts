/*eslint-disable */
import { useEffect, useCallback, useRef } from 'react';

import { toUpperFirst } from '../../utils/toUpperFirst';
// import { AllPropertiesOrNone } from '../InfiniteTable/types/Utility';
import { Setter } from '../types/Setter';
import { isControlled } from '../utils/isControlled';
import { isControlledValue } from '../utils/isControlledValue';
import { useLatest } from './useLatest';
import { usePrevious } from './usePrevious';

export const notifyChange = (props: any, propName: string, newValue: any) => {
  const upperPropName = toUpperFirst(propName);
  const callbackPropName = `on${upperPropName}Change` as string;
  const callbackProp = props[callbackPropName] as Function;

  if (typeof callbackProp === 'function') {
    callbackProp(newValue);
  }
};

function useProperty<V extends keyof T_PROPS, T_PROPS, NORMALIZED>(
  propName: V,
  props: T_PROPS,
  config: {
    fromState: (defaultValue?: NORMALIZED) => NORMALIZED;
    setState: (v: NORMALIZED) => void;
  } & {
    defaultValue?: T_PROPS[V];

    normalize?: (v?: NORMALIZED | T_PROPS[V]) => NORMALIZED;
    onControlledChange?: (n: NORMALIZED, v: NORMALIZED | T_PROPS[V]) => void;
  },
): [NORMALIZED, Setter<NORMALIZED | T_PROPS[V]>] {
  const getConfig = useLatest(config);
  const getProps = useLatest(props);

  // eslint-disable-next-line
  if (__DEV__) {
    const prevName = usePrevious(propName);
    if (prevName !== propName) {
      throw `useProperty hook: Cannot change managed property! Changed from "${prevName}" to "${propName}".`;
    }
  }

  const getNormalized = (v?: NORMALIZED | T_PROPS[V]): NORMALIZED => {
    const fn =
      getConfig().normalize ??
      ((v?: NORMALIZED | T_PROPS[V]): NORMALIZED => {
        return v as any as NORMALIZED;
      });

    return fn(v);
  };

  const stateValue = config.fromState();
  const propValue = props[propName];
  const controlled: boolean = isControlled(propName, props);

  const value: NORMALIZED = !controlled ? stateValue : getNormalized(propValue);

  const getValue = useLatest(value);

  const notify = (newValue: any) => {
    notifyChange(getProps(), propName as string, newValue);
  };

  const setValue = useCallback(
    (
      val:
        | (NORMALIZED | T_PROPS[V])
        | ((prevVal: NORMALIZED | T_PROPS[V]) => NORMALIZED | T_PROPS[V]),
    ): void => {
      const latestValue: NORMALIZED = getValue();
      const config = getConfig();

      let newValue: T_PROPS[V] | NORMALIZED =
        val instanceof Function ? val(latestValue) : val;

      newValue = getNormalized(newValue);

      if (isControlled(propName, getProps())) {
        // internalCacheRef.current = newValue; // this line is to avoid another notification later when state changes
        // config.setState(newValue);
        // CASE 2
        notify(newValue);
      } else {
        // CASE 3
        skipNotifyRef.current = newValue; // this line is to avoid another notification later when state changes
        config.setState(newValue);
        notify(newValue);
      }
    },
    [],
  );

  /***
CONTROLLED:
   1 - controlled change = config.setState + SKIP notify!!!
   2 - controlled prop + setValue = DO notify + step 1
   3 - controlled prop is same + internal state change (from config.fromState) = DO notify

UNCONTROLLED:
  - uncontrolled is same + config.fromState() value changes = DO notify
  - uncontrolled + setValue = config.setState  + DO NOTIFY

SUMMARY:
   CASE 1 - controlled change = config.setState + SKIP notify
   CASE 2 - controlled prop + setValue = DO notify  + step 1
   CASE 3 - uncontrolled prop + setValue = config.setState + DO notify = config.setState + step 4
   CASE 4 - controlled/uncontrolled prop is same + config.fromState changes = DO NOTIFY

ALSO, there is another case we need to be aware of, but maybe we don't have to handle it here:

controlled prop that doesn't update, but we call actions.setColumnOrder([...]), which should theoretically modify the internal state
but actually it shouldn't, as it should be aware that it's a controlled prop, so should just notify
*/

  const initialRenderRef = useRef(true);
  const skipNotifyRef = useRef<NORMALIZED>();

  useEffect(() => {
    // CASE 1
    // const initialRender = initialRenderRef.current;
    // if (initialRender) {
    //   return;
    // }

    const props = getProps();
    const propValue = props[propName];
    const isControlled = isControlledValue(propValue);
    if (isControlled) {
      const normalizedValue = getNormalized(propValue);
      skipNotifyRef.current = normalizedValue;
      getConfig().setState(normalizedValue);
    }
  }, [propValue]);

  useEffect(() => {
    const initialRender = initialRenderRef.current;
    if (initialRender) {
      return;
    }
    if (stateValue === skipNotifyRef.current) {
      // we had a change triggered by controlled change so we skip notify
      // part of CASE 1
      skipNotifyRef.current = undefined;
      return;
    }
    skipNotifyRef.current = undefined;
    // CASE 4
    notify(stateValue);
  }, [stateValue]);

  useEffect(() => {
    initialRenderRef.current = false;
  }, []);

  /**
   * WE NEED TO ALWAYS RETURN the value from STATE!!!
   */
  return [stateValue, setValue];
}

export { useProperty };
