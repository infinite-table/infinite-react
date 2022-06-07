// import * as ts from 'typescript';

const ts = require('typescript');
const humanize = require('humanize-string');
/**
 * Prints out particular nodes from a source file
 *
 * @param file a path to a file
 * @param identifiers top level identifiers available
 */
function extract(file, identifiers) {
  // Create a Program to represent the project, then pull out the
  // source file to parse its AST.
  let program = ts.createProgram([file], { allowJs: true });
  const sourceFile = program.getSourceFile(file);

  // To print the AST, we'll use TypeScript's printer
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });

  // To give constructive error messages, keep track of found and un-found identifiers
  const unfoundNodes = [],
    foundNodes = [];

  // Loop through the root AST nodes of the file
  ts.forEachChild(sourceFile, (node) => {
    let name = '';

    // This is an incomplete set of AST nodes which could have a top level identifier
    // it's left to you to expand this list, which you can do by using
    // https://ts-ast-viewer.com/ to see the AST of a file then use the same patterns
    // as below
    if (ts.isFunctionDeclaration(node)) {
      name = node.name.text;
      // Hide the method body when printing
      node.body = undefined;
    } else if (ts.isVariableStatement(node)) {
      name =
        node.declarationList.declarations[0].name.getText(
          sourceFile
        );
    } else if (ts.isInterfaceDeclaration(node)) {
      name = node.name.text;
    }

    const container = identifiers.includes(name)
      ? foundNodes
      : unfoundNodes;
    container.push([name, node]);
  });

  // Either print the found nodes, or offer a list of what identifiers were found
  if (!foundNodes.length) {
    console.log(
      `Could not find any of ${identifiers.join(
        ', '
      )} in ${file}, found: ${unfoundNodes
        .filter((f) => f[0])
        .map((f) => f[0])
        .join(', ')}.`
    );
    process.exitCode = 1;
    return;
  }
  const cssVarsList = [];
  foundNodes.map((f) => {
    const [_name, node] = f;

    return traverseThemeVars(
      node.declarationList.declarations[0].initializer
        .arguments[0],
      cssVarsList
    );
  });

  return cssVarsList.filter(
    ({ name }) => !name.includes('dont-override')
  );
}

function traverseThemeVars(node, list = []) {
  node.properties.forEach((prop) => {
    if (prop.initializer.properties) {
      traverseThemeVars(prop.initializer, list);
    }
    if (prop.initializer.text) {
      const description =
        prop.jsDoc && prop.jsDoc[0]
          ? prop.jsDoc[0].comment
          : '';

      let cssVarName = prop.initializer.text;
      let ignore = false;

      if (prop.jsDoc?.[0].tags) {
        const tags = prop.jsDoc[0].tags.map((tag) => {
          return {
            name: tag.tagName.text,
            comment: tag.comment,
          };
        });

        const aliasTag = tags.filter(
          (tag) => tag.name === 'alias'
        )[0];
        if (
          tags.filter((tag) => tag.name === 'ignore')[0]
        ) {
          ignore = true;
        }
        if (aliasTag) {
          cssVarName = aliasTag.comment;
        }
      }

      if (!ignore) {
        list.push({
          name: `--infinite-${cssVarName}`,
          description: description,
        });
      }
    }
  });
  return list;
}

const fs = require('fs');
const path = require('path');

// Run the extract function with the script's arguments
const vars = extract(
  path.resolve(
    __dirname,
    '../../source/src/components/InfiniteTable/theme.css.ts'
  ),
  ['ThemeVars']
);
console.log(vars);
const mdFilePath = path.resolve(
  __dirname,
  '../pages/docs/latest/learn/theming/css-variables.page.md'
);
const mdFile = fs.readFileSync(mdFilePath, 'utf8');

const formattedVars = vars.map(({ name, description }) => {
  return `
### ${humanize(name.slice('--infinite'.length))}

${description}

\`\`\`css
${name}
\`\`\``;
});
const newContents = mdFile.replace(
  /\n<!-- START VARS -->\n((.|\n)*?)\n<!-- END VARS -->/g,
  (_match, _css) => {
    return `
<!-- START VARS -->
${formattedVars.join('\n')}
<!-- END VARS -->`;
  }
);

fs.writeFileSync(mdFilePath, newContents);
