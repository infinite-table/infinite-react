// Code shown on the Vue version of handling-dates.page.md: the sibling of
// handling-dates.snippet.tsx, with the same `#region` names (the regions that
// are the same code for React and Vue are shown from the .tsx file).
// Type-checked with vue-tsc against the current source.
import { h } from 'vue';

{
  //#region render-value
  const renderValue = ({ value }: { value: Date }) => {
    return h('b', value.toISOString().split('T')[0]);
  };
  //#endregion
}

export {};
