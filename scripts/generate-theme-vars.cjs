/**
 * Generates the list of public --infinite-* CSS variables from the ThemeVars
 * contract in source/src/components/InfiniteTable/vars.css.ts (the source of truth).
 *
 * Writes two outputs:
 *  1. devtools-ui/src/lib/theme-vars.ts - the catalog used by the devtools Theme editor
 *  2. www/content/docs/learn/theming/css-variables.page.md - the docs reference page
 *     (content between the START VARS / END VARS markers)
 *
 * Run from the repo root with: npm run generate-theme-vars
 */
const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const VARS_FILE = path.resolve(
  __dirname,
  '../source/src/components/InfiniteTable/vars.css.ts',
);
const DEVTOOLS_OUT_FILE = path.resolve(
  __dirname,
  '../devtools-ui/src/lib/theme-vars.ts',
);
const DOCS_OUT_FILE = path.resolve(
  __dirname,
  '../www/content/docs/learn/theming/css-variables.page.md',
);

// top-level keys of the ThemeVars contract that should not be documented/edited
const SKIP_TOP_LEVEL_KEYS = new Set([
  'loaded',
  'themeName',
  'themeMode',
  'runtime',
]);

// group names for top-level (non-component) keys - used by the devtools Theme editor
const TOP_LEVEL_GROUPS = {
  color: 'Colors',
  background: 'Colors',
  spacing: 'Spacing',
  fontSize: 'Typography',
  fontFamily: 'Typography',
};
const DEFAULT_TOP_LEVEL_GROUP = 'General';

function humanize(value) {
  const spaced = String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .toLowerCase()
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function inferKind(cssVarName) {
  const name = cssVarName.toLowerCase();

  if (
    name.includes('alpha') ||
    name.includes('opacity') ||
    name.includes('animation') ||
    name.includes('duration') ||
    name.includes('z-index')
  ) {
    return 'text';
  }
  if (name === 'color' || name.endsWith('-color')) {
    return 'color';
  }
  if (name.includes('background') || name === 'background') {
    return 'color';
  }
  return 'text';
}

function getJsDocInfo(prop) {
  const jsDoc = prop.jsDoc && prop.jsDoc[0];
  if (!jsDoc) {
    return { description: '', alias: null, ignore: false };
  }

  let description = '';
  if (jsDoc.comment) {
    description = ts.getTextOfJSDocComment
      ? ts.getTextOfJSDocComment(jsDoc.comment) || ''
      : String(jsDoc.comment);
  }

  let alias = null;
  let ignore = false;
  if (jsDoc.tags) {
    jsDoc.tags.forEach((tag) => {
      const tagName = tag.tagName.text;
      if (tagName === 'alias') {
        alias = ts.getTextOfJSDocComment
          ? ts.getTextOfJSDocComment(tag.comment)
          : String(tag.comment);
      }
      if (tagName === 'ignore') {
        ignore = true;
      }
    });
  }

  return { description, alias, ignore };
}

function extract() {
  const program = ts.createProgram([VARS_FILE], { allowJs: true });
  const sourceFile = program.getSourceFile(VARS_FILE);

  let contractNode = null;
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isVariableStatement(node)) {
      const decl = node.declarationList.declarations[0];
      if (decl.name.getText(sourceFile) === 'ThemeVars') {
        contractNode = decl.initializer.arguments[0];
      }
    }
  });

  if (!contractNode) {
    throw new Error('Could not find ThemeVars in ' + VARS_FILE);
  }

  const list = [];

  const visitProp = (prop, pathKeys, group) => {
    const key = prop.name.getText(sourceFile).replace(/['"]/g, '');

    if (pathKeys.length === 0 && SKIP_TOP_LEVEL_KEYS.has(key)) {
      return;
    }

    if (prop.initializer && prop.initializer.properties) {
      if (pathKeys.length === 0 && key === 'components') {
        // each component gets its own group
        prop.initializer.properties.forEach((componentProp) => {
          const componentName = componentProp.name.getText(sourceFile);
          componentProp.initializer.properties.forEach((leaf) => {
            visitProp(leaf, [key, componentName], componentName);
          });
        });
        return;
      }

      const nextGroup =
        group ||
        (pathKeys.length === 0
          ? TOP_LEVEL_GROUPS[key] || DEFAULT_TOP_LEVEL_GROUP
          : DEFAULT_TOP_LEVEL_GROUP);
      prop.initializer.properties.forEach((leaf) => {
        visitProp(leaf, pathKeys.concat(key), nextGroup);
      });
      return;
    }

    const { description, alias, ignore } = getJsDocInfo(prop);
    if (ignore) {
      return;
    }

    let cssVarName = null;
    if (prop.initializer && ts.isStringLiteral(prop.initializer)) {
      cssVarName = prop.initializer.text;
    }
    if (alias) {
      cssVarName = alias;
    }
    if (!cssVarName || cssVarName.includes('dont-override')) {
      return;
    }

    const finalGroup =
      group ||
      (pathKeys.length === 0
        ? TOP_LEVEL_GROUPS[key] || DEFAULT_TOP_LEVEL_GROUP
        : DEFAULT_TOP_LEVEL_GROUP);

    let label = humanize(key);
    if (/^\d+$/.test(key)) {
      const parent = pathKeys[pathKeys.length - 1];
      label = `${humanize(parent)} ${key}`;
    }

    list.push({
      name: `--infinite-${cssVarName}`,
      label,
      group: finalGroup,
      kind: inferKind(cssVarName),
      description: (description || '').trim(),
    });
  };

  contractNode.properties.forEach((prop) => visitProp(prop, [], null));

  return list;
}

function writeDevtoolsCatalog(vars) {
  const groupsInOrder = [];
  vars.forEach((v) => {
    if (!groupsInOrder.includes(v.group)) {
      groupsInOrder.push(v.group);
    }
  });

  const output = `// AUTO-GENERATED by scripts/generate-theme-vars.cjs (repo root) - DO NOT EDIT MANUALLY.
// Source of truth: source/src/components/InfiniteTable/vars.css.ts
// Regenerate with: npm run generate-theme-vars (in the repo root)

export type ThemeVarKind = 'color' | 'text';

export type ThemeVarMeta = {
  name: string;
  label: string;
  group: string;
  kind: ThemeVarKind;
  description?: string;
};

export const THEME_VAR_GROUPS: string[] = ${JSON.stringify(
    groupsInOrder,
    null,
    2,
  )};

export const THEME_VARS: ThemeVarMeta[] = ${JSON.stringify(vars, null, 2)};
`;

  fs.writeFileSync(DEVTOOLS_OUT_FILE, output);
  console.log(
    `Wrote ${vars.length} theme vars (${groupsInOrder.length} groups) to ${path.relative(
      process.cwd(),
      DEVTOOLS_OUT_FILE,
    )}`,
  );
}

function writeDocsPage(vars) {
  const mdFile = fs.readFileSync(DOCS_OUT_FILE, 'utf8');

  const formattedVars = vars.map(({ name, description }) => {
    return `
### ${humanize(name.slice('--infinite'.length))}

${description}

\`\`\`css
${name}
\`\`\``;
  });

  const markersRegex = /\{\/\* START VARS \*\/\}((.|\n)*?)\{\/\* END VARS \*\/\}/g;

  if (!markersRegex.test(mdFile)) {
    throw new Error(
      `Could not find the {/* START VARS */} ... {/* END VARS */} markers in ${DOCS_OUT_FILE}`,
    );
  }
  markersRegex.lastIndex = 0;

  const newContents = mdFile.replace(markersRegex, () => {
    return `{/* START VARS */}
${formattedVars.join('\n')}

{/* END VARS */}`;
  });

  fs.writeFileSync(DOCS_OUT_FILE, newContents);
  console.log(
    `Wrote ${vars.length} theme vars to ${path.relative(
      process.cwd(),
      DOCS_OUT_FILE,
    )}`,
  );
}

const vars = extract();
writeDevtoolsCatalog(vars);
writeDocsPage(vars);
