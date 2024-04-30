import { MenuItemObject } from './MenuProps';

function MenuItem(_props: {
  key: MenuItemObject['key'];
  span?: MenuItemObject['span'];
  label?: MenuItemObject['label'];
  children?: MenuItemObject['description'];
  description?: MenuItemObject['description'];
  __is_menu_item: boolean;
}) {
  // this component is just for declaratively rendering menu items when used in static situations like:

  /**
   * 
      <Menu>
        <MenuItem key="copy">Copy</MenuItem>
        <MenuItem key="paste">Paste</MenuItem>
      </Menu>
   */

  // should not be used in dynamic situations like:

  /**
   * 
   <Menu items={[...]} />
   */

  return null;
}

MenuItem.defaultProps = {
  __is_menu_item: true,
};

export { MenuItem };
