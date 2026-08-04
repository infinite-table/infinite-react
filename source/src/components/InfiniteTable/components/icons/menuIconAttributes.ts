import { keyMirror } from '../../../../utils/keyMirror';

export const MenuIconDataAttributes = keyMirror({
  'data-name': '',
});

export const MenuIconDataAttributesValues: {
  [K in keyof typeof MenuIconDataAttributes]: string;
} = {
  [MenuIconDataAttributes['data-name']]: 'menu-icon',
};

export const menuIconSelector = `[${MenuIconDataAttributes['data-name']}="${MenuIconDataAttributesValues['data-name']}"]`;
