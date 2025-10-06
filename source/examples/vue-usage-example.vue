<template>
  <div>
    <h1>InfiniteTable Vue Components Example</h1>
    
    <!-- LoadMask Component Example -->
    <section>
      <h2>LoadMask Component (Vue)</h2>
      <div style="position: relative; height: 100px; border: 1px solid #ccc;">
        <LoadMask :visible="isLoading">
          Loading Vue component data...
        </LoadMask>
      </div>
      <button @click="toggleLoading">Toggle Loading</button>
    </section>
    
    <!-- CheckBox Component Example -->
    <section>
      <h2>CheckBox Component (Vue)</h2>
      <InfiniteCheckBox
        :checked="checkboxState"
        @change="handleCheckboxChange"
      />
      <p>Current state: {{ checkboxState === null ? 'indeterminate' : checkboxState }}</p>
      <button @click="toggleCheckbox">Toggle Checkbox</button>
    </section>
    
    <!-- Filter Editors Example -->
    <section>
      <h2>Filter Editors (Vue)</h2>
      <div style="margin: 10px 0;">
        <label>String Filter:</label>
        <StringFilterEditor />
      </div>
      <div style="margin: 10px 0;">
        <label>Number Filter:</label>
        <NumberFilterEditor />
      </div>
    </section>

    <!-- Icon Components Example -->
    <section>
      <h2>Icon Components (Vue)</h2>
      <div style="margin: 10px 0; display: flex; gap: 10px; align-items: center;">
        <label>Icons:</label>
        <ArrowDown :size="24" />
        <ArrowUp :size="24" />
        <Icon :size="20" style="color: blue;">
          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
        </Icon>
      </div>
    </section>

    <!-- ResizeObserver Example -->
    <section>
      <h2>ResizeObserver (Vue)</h2>
      <div style="position: relative; width: 200px; height: 100px; border: 2px solid #333; resize: both; overflow: auto;">
        <ResizeObserver @resize="handleResize" />
        <p style="margin: 0; padding: 10px;">Resize this box!</p>
      </div>
      <p>Size: {{ containerSize.width }}x{{ containerSize.height }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoadMask from '../src/components/InfiniteTable/components/LoadMask.vue';
import CheckBox from '../src/components/InfiniteTable/components/CheckBox.vue';
import StringFilterEditor from '../src/components/InfiniteTable/components/StringFilterEditor.vue';
import NumberFilterEditor from '../src/components/InfiniteTable/components/NumberFilterEditor.vue';
import ResizeObserver from '../src/components/ResizeObserver/index.vue';
import Icon from '../src/components/InfiniteTable/components/icons/Icon.vue';
import ArrowDown from '../src/components/InfiniteTable/components/icons/ArrowDown.vue';
import ArrowUp from '../src/components/InfiniteTable/components/icons/ArrowUp.vue';
import type { InfiniteCheckBoxPropChecked } from '../src/components/InfiniteTable/components/CheckBox';
import type { Size } from '../src/components/types/Size';

// Rename for template usage
const InfiniteCheckBox = CheckBox;

const isLoading = ref(true);
const checkboxState = ref<InfiniteCheckBoxPropChecked>(false);
const containerSize = ref<Size>({ width: 0, height: 0 });

const toggleLoading = () => {
  isLoading.value = !isLoading.value;
};

const handleCheckboxChange = (checked: InfiniteCheckBoxPropChecked) => {
  checkboxState.value = checked;
};

const toggleCheckbox = () => {
  if (checkboxState.value === false) {
    checkboxState.value = true;
  } else if (checkboxState.value === true) {
    checkboxState.value = null;
  } else {
    checkboxState.value = false;
  }
};

const handleResize = (size: Size) => {
  containerSize.value = size;
};
</script>

<style scoped>
section {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

h2 {
  margin-top: 0;
}

button {
  margin: 10px 5px;
  padding: 8px 16px;
  border: 1px solid #007acc;
  background: #007acc;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #005999;
}

label {
  display: inline-block;
  width: 120px;
  font-weight: bold;
}
</style>