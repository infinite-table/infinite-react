import { watch, ref, onMounted, Ref } from 'vue';

export function useEffectWithChanges<T>(
  fn: (
    changes: Record<keyof T, any>,
    prevValues: Record<string, any>,
  ) => void | (() => void),
  deps: Record<keyof T, any>,
) {
  const prevRef = ref({});
  const oldValuesRef = ref<Record<string, any>>({});
  const changesRef = ref<Record<keyof T, any>>({} as Record<keyof T, any>);
  
  let cleanup: (() => void) | void;

  const watchSources = Object.keys(deps).map(key => 
    typeof deps[key] === 'object' && deps[key] && 'value' in deps[key] 
      ? deps[key] as Ref 
      : ref(deps[key])
  );

  watch(watchSources, () => {
    const changes: Record<string, any> = {};
    const oldValues: Record<string, any> = {};

    for (const k in deps) {
      if (deps.hasOwnProperty(k)) {
        if (deps[k] !== (prevRef.value as any)[k]) {
          changes[k] = deps[k];
          oldValues[k] = (prevRef.value as any)[k];
        }
      }
    }

    prevRef.value = deps;

    if (Object.keys(changes).length !== 0) {
      // Clean up previous effect
      if (cleanup) {
        cleanup();
      }
      
      cleanup = fn(changes, oldValues);
    }
  }, { immediate: false });

  // Cleanup on unmount
  return () => {
    if (cleanup) {
      cleanup();
    }
  };
}

export function useLayoutEffectWithChanges<T>(
  fn: (
    changes: Record<keyof T, any>,
    prevValues: Record<string, any>,
  ) => void | (() => void),
  deps: Record<keyof T, any>,
) {
  // In Vue, we use immediate watch to simulate layout effect behavior
  const prevRef = ref({});
  const oldValuesRef = ref<Record<string, any>>({});
  const changesRef = ref<Record<keyof T, any>>({} as Record<keyof T, any>);
  
  let cleanup: (() => void) | void;

  const watchSources = Object.keys(deps).map(key => 
    typeof deps[key] === 'object' && deps[key] && 'value' in deps[key] 
      ? deps[key] as Ref 
      : ref(deps[key])
  );

  watch(watchSources, () => {
    const changes: Record<string, any> = {};
    const oldValues: Record<string, any> = {};

    for (const k in deps) {
      if (deps.hasOwnProperty(k)) {
        if (deps[k] !== (prevRef.value as any)[k]) {
          changes[k] = deps[k];
          oldValues[k] = (prevRef.value as any)[k];
        }
      }
    }

    prevRef.value = deps;

    if (Object.keys(changes).length !== 0) {
      // Clean up previous effect
      if (cleanup) {
        cleanup();
      }
      
      cleanup = fn(changes, oldValues);
    }
  }, { immediate: false, flush: 'sync' }); // sync flush for layout effect behavior

  // Cleanup on unmount
  return () => {
    if (cleanup) {
      cleanup();
    }
  };
}

export function useEffectWithObject(
  fn: () => void | (() => void),
  deps: Record<string, any>,
) {
  let cleanup: (() => void) | void;

  const watchSources = Object.keys(deps).map(key => 
    typeof deps[key] === 'object' && deps[key] && 'value' in deps[key] 
      ? deps[key] as Ref 
      : ref(deps[key])
  );

  watch(watchSources, () => {
    // Clean up previous effect
    if (cleanup) {
      cleanup();
    }
    
    cleanup = fn();
  }, { immediate: true });

  // Cleanup on unmount
  return () => {
    if (cleanup) {
      cleanup();
    }
  };
}