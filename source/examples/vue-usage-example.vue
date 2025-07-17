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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoadMask from '../src/components/InfiniteTable/components/LoadMask.vue';
import CheckBox from '../src/components/InfiniteTable/components/CheckBox.vue';
import StringFilterEditor from '../src/components/InfiniteTable/components/StringFilterEditor.vue';
import NumberFilterEditor from '../src/components/InfiniteTable/components/NumberFilterEditor.vue';
import type { InfiniteCheckBoxPropChecked } from '../src/components/InfiniteTable/components/CheckBox';

// Rename for template usage
const InfiniteCheckBox = CheckBox;

const isLoading = ref(true);
const checkboxState = ref<InfiniteCheckBoxPropChecked>(false);

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