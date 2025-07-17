<script setup lang="ts">
import type { MenuItemObject } from './MenuProps';

// This component is just for declaratively rendering menu items when used in static situations like:
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
 <Menu :items="[...]" />
 */

interface Props {
  key: MenuItemObject['key'];
  span?: MenuItemObject['span'];
  label?: MenuItemObject['label'];
  children?: MenuItemObject['description'];
  description?: MenuItemObject['description'];
  __is_menu_item?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  __is_menu_item: true,
});

// This component renders nothing - it's just a marker for declarative usage
</script>

<template>
  <!-- This component intentionally renders nothing -->
</template>