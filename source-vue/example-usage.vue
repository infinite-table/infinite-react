<template>
  <div>
    <h1>InfiniteTable Vue Components Example</h1>
    
    <!-- LoadMask Component Example -->
    <section>
      <h2>LoadMask Component</h2>
      <LoadMask :visible="isLoading">
        Loading data...
      </LoadMask>
      <button @click="toggleLoading">Toggle Loading</button>
    </section>
    
    <!-- CheckBox Component Example -->
    <section>
      <h2>CheckBox Component</h2>
      <InfiniteCheckBox
        :checked="checkboxState"
        @change="handleCheckboxChange"
      />
      <p>Current state: {{ checkboxState }}</p>
      <button @click="toggleCheckbox">Toggle Checkbox</button>
    </section>
    
    <!-- Filter Editors Example -->
    <section>
      <h2>Filter Editors</h2>
      <div>
        <label>String Filter:</label>
        <StringFilterEditor />
      </div>
      <div>
        <label>Number Filter:</label>
        <NumberFilterEditor />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LoadMask } from './src/components/InfiniteTable/components/LoadMask';
import { InfiniteCheckBox } from './src/components/InfiniteTable/components/CheckBox';
import { StringFilterEditor, NumberFilterEditor } from './src/components/InfiniteTable/components/FilterEditors';
import type { InfiniteCheckBoxPropChecked } from './src/components/InfiniteTable/components/CheckBox.vue';

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

div {
  margin: 10px 0;
}

label {
  display: inline-block;
  width: 120px;
  font-weight: bold;
}
</style>