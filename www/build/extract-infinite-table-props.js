const ts = require('typescript');
const fs = require('fs');
const path = require('path');

/**
 * Extracts prop names from InfiniteTableProps interface
 * @param filePath Path to the InfiniteTableProps.ts file
 * @returns Array of prop names
 */
function extractInfiniteTableProps(filePath) {
  // Create a Program to represent the project
  const program = ts.createProgram([filePath], {
    allowJs: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.CommonJS,
  });

  const sourceFile = program.getSourceFile(filePath);
  const props = [];
  const typeDefinitions = new Map();

  // First pass: collect all type definitions
  function collectTypeDefinitions(node) {
    if (
      (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
      node.name
    ) {
      const typeName = node.name.text;
      typeDefinitions.set(typeName, node);
    }

    ts.forEachChild(node, collectTypeDefinitions);
  }

  // Second pass: extract properties from InfiniteTableProps and nested types
  function extractPropertiesFromType(node, prefix = '') {
    if (
      ts.isInterfaceDeclaration(node) &&
      node.name.text === 'InfiniteTableProps'
    ) {
      // Found the InfiniteTableProps interface
      node.members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.name) {
          const propName = member.name.getText(sourceFile);
          props.push(propName);

          // Check if this property has a nested type
          if (member.type && ts.isTypeReferenceNode(member.type)) {
            const typeName = member.type.typeName.getText(sourceFile);
            const nestedType = typeDefinitions.get(typeName);
            if (nestedType) {
              if (typeName === 'InfiniteTablePropColumnTypes') {
                // Special handling for columnTypes - extract from InfiniteTableColumnType
                const columnType = typeDefinitions.get(
                  'InfiniteTableColumnType',
                );
                if (columnType) {
                  extractPropertiesFromType(columnType, propName + '.');
                }
              } else {
                extractPropertiesFromType(nestedType, propName + '.');
              }
            }
          }
        }
      });
    } else if (
      ts.isTypeAliasDeclaration(node) &&
      node.type &&
      ts.isTypeLiteralNode(node.type)
    ) {
      // Handle type aliases with type literals
      node.type.members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.name) {
          const propName = member.name.getText(sourceFile);
          const fullPropName = prefix + propName;
          props.push(fullPropName);
        }
      });
    } else if (ts.isInterfaceDeclaration(node)) {
      // Handle interfaces
      node.members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.name) {
          const propName = member.name.getText(sourceFile);
          const fullPropName = prefix + propName;
          props.push(fullPropName);
        }
      });
    } else if (
      ts.isTypeAliasDeclaration(node) &&
      node.type &&
      ts.isTypeReferenceNode(node.type)
    ) {
      // Handle generic types like InfiniteTablePropColumnTypes<T> -> InfiniteTableColumnType<T>
      const typeName = node.type.typeName.getText(sourceFile);
      const genericType = typeDefinitions.get(typeName);
      if (genericType) {
        extractPropertiesFromType(genericType, prefix);
      }
    } else if (
      ts.isTypeAliasDeclaration(node) &&
      node.name.text === 'InfiniteTablePropColumnTypes'
    ) {
      // Special handling for InfiniteTablePropColumnTypes
      const columnType = typeDefinitions.get('InfiniteTableColumnType');
      if (columnType) {
        extractPropertiesFromType(columnType, prefix);
      }
    }
  }

  // Collect all type definitions first
  collectTypeDefinitions(sourceFile);

  // Extract properties from InfiniteTableProps
  ts.forEachChild(sourceFile, (node) => {
    if (
      ts.isInterfaceDeclaration(node) &&
      node.name.text === 'InfiniteTableProps'
    ) {
      extractPropertiesFromType(node);
    }
  });

  return props;
}

// Main execution
const propsFilePath = path.resolve(
  __dirname,
  '../../source/src/components/InfiniteTable/types/InfiniteTableProps.ts',
);
const outputPath = path.resolve(
  __dirname,
  '../src/utils/infinite-table-props.json',
);

try {
  const propNames = extractInfiniteTableProps(propsFilePath);

  // Create the output directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the prop names to a JSON file
  const output = {
    propNames: propNames,
    generatedAt: new Date().toISOString(),
    sourceFile: propsFilePath,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(
    `Extracted ${propNames.length} prop names from InfiniteTableProps`,
  );
  console.log(`Output written to: ${outputPath}`);
} catch (error) {
  console.error('Error extracting prop names:', error);
  process.exit(1);
}
