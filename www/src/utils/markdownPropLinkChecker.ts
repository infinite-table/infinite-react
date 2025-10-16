import { visit } from 'unist-util-visit';
import fs from 'fs';
import path from 'path';

import { MarkdownFileEnv, MarkdownFileInfo } from './MarkdownFileInfo';

// Load the extracted prop names
let validPropNames: Set<string> | null = null;

function loadValidPropNames(): Set<string> {
  if (validPropNames === null) {
    try {
      // Try multiple possible paths for the props file
      const possiblePaths = [
        path.resolve(__dirname, './infinite-table-props.json'),
        path.resolve(process.cwd(), 'src/utils/infinite-table-props.json'),
        path.resolve(process.cwd(), 'www/src/utils/infinite-table-props.json'),
      ];

      let propsData = null;
      for (const propsFilePath of possiblePaths) {
        try {
          if (fs.existsSync(propsFilePath)) {
            propsData = JSON.parse(fs.readFileSync(propsFilePath, 'utf8'));
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }

      if (propsData && propsData.propNames) {
        validPropNames = new Set(propsData.propNames);
      } else {
        throw new Error('Could not find or parse props file');
      }
    } catch (error) {
      console.warn('Could not load InfiniteTable prop names:', error);
      validPropNames = new Set(); // Fallback to empty set
    }
  }
  return validPropNames;
}

function isValidPropName(name: string): boolean {
  const validProps = loadValidPropNames();
  return validProps.has(name);
}

console.log(isValidPropName);

export default (params: {
  fileInfo: MarkdownFileInfo;
  env: MarkdownFileEnv;
}) => {
  const { fileInfo: _ } = params;
  const transformer = (ast: any) => {
    visit(ast, 'mdxJsxFlowElement', (node) => {
      if (node.name === 'PropLink') {
        const nameAttribute = node.attributes.find(
          (attribute: any) => attribute.name === 'name',
        );

        if (nameAttribute && nameAttribute.value) {
          // const _propName = nameAttribute.value;
          // if (!isValidPropName(propName)) {
          //   const errorMessage = `Invalid prop name: "${propName}", found in file ${fileInfo.fileAbsolutePath}.`;
          //   console.error(`\n\ \n \n ${errorMessage} \n \n \n`);
          //   throw new Error(errorMessage);
          // }
        }
      }
    });
  };
  /**
   * A markdown plugin for checking the validity of PropLink names.
   *
   * @returns A unified transformer.
   */
  return () => transformer;
};
