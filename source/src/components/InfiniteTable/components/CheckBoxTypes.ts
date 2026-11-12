import type { HTMLProps } from '../../types/FrameworkTypes';

export type InfiniteCheckBoxPropChecked = true | false | null;
export type InfiniteCheckBoxProps = {
  disabled?: boolean;
  checked?: InfiniteCheckBoxPropChecked;
  defaultChecked?: InfiniteCheckBoxPropChecked;
  onChange?: (checked: InfiniteCheckBoxPropChecked) => void;
  domProps?: HTMLProps<HTMLElement>;
};
