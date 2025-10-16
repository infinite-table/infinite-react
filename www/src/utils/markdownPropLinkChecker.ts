import { visit } from 'unist-util-visit';

import { MarkdownFileEnv, MarkdownFileInfo } from './MarkdownFileInfo';

import infiniteTableProps from '../../../source/infinite-table-props.api.json';

let membersMap: Map<string, any> = new Map<string, any>();

function isValidPropName(name: string): boolean {
  if (membersMap.size === 0) {
    const entryPoint = infiniteTableProps.members.find(
      (member) => member.kind === 'EntryPoint',
    );

    const InfiniteTableProps = entryPoint!.members.find(
      (member) => member.name === 'InfiniteTableProps',
    );

    membersMap = InfiniteTableProps!.members!.reduce((acc, member) => {
      acc.set(member.name, {
        name: member.name,
        // type: member.type,
        // description: member.description,
        // tags: member.tags,
      });
      return acc;
    }, new Map<string, {}>());
  }
  return membersMap.has(name);
}

export default (params: {
  fileInfo: MarkdownFileInfo;
  env: MarkdownFileEnv;
}) => {
  const { fileInfo } = params;
  const transformer = (ast: any) => {
    visit(ast, 'mdxJsxFlowElement', (node) => {
      if (
        node.name === 'PropLink' ||
        (node.name === 'Prop' &&
          fileInfo.routePath === '/docs/reference/infinite-table-props')
      ) {
        const CmpName = node.name;
        const nameAttribute = node.attributes.find(
          (attribute: any) => attribute.name === 'name',
        );

        if (nameAttribute && nameAttribute.value) {
          const propName = nameAttribute.value;

          if (!isValidPropName(propName)) {
            // todo implement check for nested properties
            if (propName.includes('.')) {
              return;
            }
            const errorMessage = `<${CmpName} name="${propName}" /> is invalid.

Property "${propName}" is not valid. Found in file ${fileInfo.fileAbsolutePath}.

`;
            console.error(`\n\ \n \n ${errorMessage} \n \n \n`);
            throw new Error(errorMessage);
          }
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
