import * as React from 'react';
import { HTMLProps, Ref } from 'react';

import { IconSearch } from './Icon/IconSearch';

type StyledInputProps = Partial<
  HTMLInputElement & {
    children?: React.HTMLProps<HTMLFormElement>['children'];
    icon?: React.ReactNode;
    style?: React.CSSProperties;
    onChange: HTMLProps<HTMLInputElement>['onChange'];
    autoFocus?: boolean;
  }
>;
export const StyledInput = React.forwardRef(function StyledInput(
  props: StyledInputProps,
  ref: Ref<HTMLInputElement>,
) {
  return (
    <form
      style={props.style}
      className={`text-gray-30 bg-gray-80 flex flex-row rounded-lg items-center hover:bg-gray-80/95 ${props.className}`}
    >
      <label className="inline-block mx-2">
        {props.icon || (
          <IconSearch className="mx-2  group-betterhover:hover:text-gray-70 "></IconSearch>
        )}
      </label>
      <input
        ref={ref}
        type="text"
        title="Filter props"
        name="prop-filter"
        placeholder={props.placeholder || 'Type to filter props'}
        onChange={props.onChange}
        defaultValue={props.defaultValue}
        autoFocus={props.autoFocus}
        value={props.value}
        className="bg-transparent flex-1 py-2 outline-none"
      />
      {props.children}
    </form>
  );
});
