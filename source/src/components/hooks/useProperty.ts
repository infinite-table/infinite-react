/*eslint-disable */
import { useState, useEffect, useCallback } from 'react';
import { toUpperFirst } from '../../utils/toUpperFirst';
import { AllPropertiesOrNone } from '../Table/types/Utility';
import { Setter } from '../types/Setter';
import isControlled from '../utils/isControlled';
import isControlledValue from '../utils/isControlledValue';
import { useLatest } from './useLatest';
import usePrevious from './usePrevious';

const DEFAULT_CONFIG = {
  controlledToState: true,
  defaultValue: undefined,
};

function useProperty<V extends keyof T_PROPS, T_PROPS, NORMALIZED>(
  propName: V,
  props: T_PROPS,
  config: AllPropertiesOrNone<{
    fromState?: (defaultValue?: NORMALIZED) => NORMALIZED;
    setState?: (v: NORMALIZED) => void;
  }> & {
    defaultValue?: T_PROPS[V];

    normalize?: (v?: NORMALIZED | T_PROPS[V]) => NORMALIZED;
    onControlledChange?: (n: NORMALIZED, v: NORMALIZED | T_PROPS[V]) => void;
    controlledToState?: boolean;
  } = {
    normalize: (v?: NORMALIZED | T_PROPS[V]): NORMALIZED => {
      return (v as any) as NORMALIZED;
    },
    controlledToState: DEFAULT_CONFIG.controlledToState,
  },
): [NORMALIZED, Setter<NORMALIZED | T_PROPS[V]>] {
  config = config ?? DEFAULT_CONFIG;
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
        return (v as any) as NORMALIZED;
      });

    return fn(v);
  };

  const controlledToState =
    config.controlledToState ?? DEFAULT_CONFIG.controlledToState;

  const upperPropName = toUpperFirst(propName as string);
  const defaultPropName = `default${upperPropName}` as V;

  const defaultValue =
    props[defaultPropName] !== undefined
      ? props[defaultPropName]
      : config.defaultValue;

  let [stateValue, setStateValue] = useState<NORMALIZED>(() => {
    let val = getNormalized(defaultValue);
    const config = getConfig();

    if (config && config.fromState) {
      val = config.fromState(val);
    }

    return val;
  });

  if (config && config.fromState) {
    stateValue = config.fromState();
  }

  const propValue = props[propName];

  const controlled: boolean = isControlled(propName, props);
  const storeInState = !controlled || controlledToState;

  const value: NORMALIZED = !controlled ? stateValue : getNormalized(propValue);
  const getValue = useLatest(value);

  const setState = useCallback(
    (
      value: NORMALIZED | T_PROPS[V],
      beforeSetState?: (
        normalizedValue: NORMALIZED,
        value: NORMALIZED | T_PROPS[V],
      ) => void,
    ) => {
      const config = getConfig();
      const normalizedValue: NORMALIZED = getNormalized(value);

      if (beforeSetState) {
        beforeSetState(normalizedValue, value);
      }
      if (config && config.setState) {
        config.setState(normalizedValue);
      } else {
        setStateValue(normalizedValue);
      }
    },
    [setStateValue],
  );

  const setValue = useCallback(
    (
      val:
        | (NORMALIZED | T_PROPS[V])
        | ((prevVal: NORMALIZED | T_PROPS[V]) => NORMALIZED | T_PROPS[V]),
    ): void => {
      const latestValue: NORMALIZED = getValue();

      let newValue: T_PROPS[V] | NORMALIZED =
        val instanceof Function ? val(latestValue) : val;

      newValue = getNormalized(newValue);

      if (!isControlled(propName, getProps())) {
        if (storeInState) {
          setState(newValue);
        }
      }

      const callbackPropName = `on${upperPropName}Change` as string;
      const callbackProp = (getProps() as any)[callbackPropName] as Function;

      if (typeof callbackProp === 'function') {
        callbackProp(newValue);
      }
    },
    [setState, storeInState],
  );

  useEffect(() => {
    const config = getConfig();
    const propValue = getProps()[propName];

    if (isControlledValue(propValue) && config?.controlledToState) {
      setState(propValue, config.onControlledChange);
    }
  }, [propValue, setState]);

  return [value, setValue];
}

export { useProperty };
