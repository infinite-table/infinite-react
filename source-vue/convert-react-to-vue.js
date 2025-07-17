#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Conversion utilities
function convertReactImportsToVue(content) {
  // Remove React imports
  content = content.replace(/import \* as React from ['"]react['"];\s*\n/g, '');
  content = content.replace(/import React[^;]*;\s*\n/g, '');
  content = content.replace(/import \{ [^}]* \} from ['"]react['"];\s*\n/g, '');
  
  // Convert React hooks to Vue composables
  content = content.replace(/import \{ ([^}]*) \} from ['"]react['"];/g, (match, hooks) => {
    const vueHooks = hooks
      .split(',')
      .map(hook => hook.trim())
      .filter(hook => {
        // Map common React hooks to Vue equivalents
        const reactToVueMap = {
          'useState': 'ref, reactive',
          'useEffect': 'onMounted, onUnmounted, watch',
          'useLayoutEffect': 'onMounted',
          'useCallback': 'computed',
          'useMemo': 'computed',
          'useRef': 'ref',
          'useContext': 'inject',
          'useReducer': 'reactive'
        };
        return reactToVueMap[hook];
      })
      .join(', ');
    
    if (vueHooks) {
      return `import { ${vueHooks} } from 'vue';`;
    }
    return '';
  });
  
  return content;
}

function convertJSXToTemplate(content) {
  // This is a simplified conversion - in practice, JSX to template conversion is complex
  // We'll need manual conversion for complex cases
  
  // Convert className to class
  content = content.replace(/className=/g, 'class=');
  
  // Convert React props to Vue props
  content = content.replace(/\{([^}]+)\}/g, (match, expression) => {
    // Simple expression conversion
    if (expression.includes('props.')) {
      return `{{ ${expression.replace(/props\./g, '')} }}`;
    }
    return match;
  });
  
  return content;
}

function createVueComponent(tsxPath, content) {
  const componentName = path.basename(tsxPath, '.tsx');
  const relativePath = path.relative('source/src', tsxPath);
  const vueDir = path.dirname(path.join('source-vue/src', relativePath));
  const vuePath = path.join(vueDir, componentName + '.vue');
  
  // Ensure directory exists
  fs.mkdirSync(vueDir, { recursive: true });
  
  // Extract component function/JSX
  const componentMatch = content.match(/function\s+\w+[^{]*\{([\s\S]*)\}/);
  if (!componentMatch) {
    console.log(`Skipping ${tsxPath} - no component function found`);
    return;
  }
  
  // Simple template extraction (this is simplified)
  let template = '<template>\n  <!-- TODO: Convert JSX manually -->\n</template>\n\n';
  
  // Extract imports and convert
  const importLines = content.match(/^import[^;]*;$/gm) || [];
  const convertedImports = convertReactImportsToVue(importLines.join('\n'));
  
  // Create Vue SFC
  const vueContent = `${template}<script setup lang="ts">
${convertedImports}
// TODO: Convert component logic from ${componentName}.tsx

// Props interface
interface Props {
  // TODO: Define props based on original React component
}

const props = defineProps<Props>();

// TODO: Convert React component logic to Vue Composition API
</script>

<style scoped>
/* Component styles if any */
</style>
`;

  fs.writeFileSync(vuePath, vueContent);
  console.log(`Created Vue component: ${vuePath}`);
  
  // Create TypeScript export file
  const tsPath = path.join(vueDir, componentName + '.ts');
  const tsContent = `import ${componentName}Vue from './${componentName}.vue';

export const ${componentName} = ${componentName}Vue;
`;
  fs.writeFileSync(tsPath, tsContent);
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      createVueComponent(fullPath, content);
    }
  }
}

// Main execution
console.log('Starting React to Vue conversion...');
processDirectory('source/src/components');
console.log('Conversion completed. Manual review and fixes needed for each component.');