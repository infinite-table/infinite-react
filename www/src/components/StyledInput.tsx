import * as React from 'react';
import { HTMLProps, Ref } from 'react';

import { IconSearch } from './Icon/IconSearch';

type StyledInputProps = Partial<
  HTMLInputElement & {
    children?: React.HTMLProps<HTMLFormElement>['children'];
    icon?: React.ReactNode;
    style?: React.CSSProperties;
    onChange: HTMLProps<HTMLInputElement>['onChange'];
  }
>;
export const StyledInput = React.forwardRef(
  function StyledInput(
    props: StyledInputProps,
    ref: Ref<HTMLInputElement>
  ) {
    return (
      <form
        style={props.style}
        className={`text-secondary dark:text-gray-30 dark:bg-gray-80 flex flex-row bg-secondary-button rounded-lg items-center betterhover:hover:bg-opacity-80 ${props.className}`}>
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
          placeholder={
            props.placeholder || 'Type to filter props'
          }
          onChange={props.onChange}
          defaultValue={props.defaultValue}
          value={props.value}
          className="bg-transparent flex-1 py-2 outline-none"
        />
        {props.children}
      </form>
    );
  }
);
