import { ref, Ref } from 'vue';

export function useLatest<T>(value: T): () => T {
  const valueRef: Ref<T> = ref(value) as Ref<T>;
  valueRef.value = value;

  return () => valueRef.value;
}