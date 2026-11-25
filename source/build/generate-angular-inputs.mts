/**
 * Generates the inputs, models and outputs of the Angular components from
 * the shared prop types, so the Angular API can't drift from them.
 *
 *   node build/generate-angular-inputs.mts          # write the files
 *   node build/generate-angular-inputs.mts --check  # fail if they're stale
 *
 * For every component it writes an abstract `@Directive()` base class the
 * component extends (`*Inputs.generated.angular.ts`) - Angular's compiler
 * needs every input/output declared as a class member - and the metadata the
 * state adapter (useManagedComponent.angular.ts) maps the members back to
 * the shared props with.
 *
 * The rules (one per prop of the shared type):
 * - `x` with an `onXChange` callback: `x = model()` (`[(x)]`), unless the
 *   value the grid reports can't replace what is bound (NOT_MODELS): then
 *   `x = input()` + `xChange = output()`
 * - `defaultX`: `input()`
 * - `onXChange` with no `x`: `xChange = output()`
 * - other `onX` callbacks: `x = output()`. A DOM event as the second
 *   argument is merged into the payload (`{ ...context, event }`)
 * - callbacks whose return value the grid reads (`onKeyDown`) stay function
 *   inputs with the same name
 * - callbacks with a second argument that isn't an event also get a function
 *   input with the same name and the full signature (`[onRowSelectionChange]`)
 * - everything else: `input()`; plain booleans accept the bare attribute
 *
 * It also writes angular-props.generated.json - the React name -> Angular
 * name map the docs use.
 */
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const SOURCE = path.resolve(import.meta.dirname, '..');
const SRC = path.join(SOURCE, 'src');
const CHECK = process.argv.includes('--check');

type Target = {
  /** the generated file, relative to src */
  out: string;
  className: string;
  metaName: string;
  /** the type whose props are generated, with the file it's exported from */
  typeName: string;
  typeFile: string;
  /** more prop types merged in (keys not already there) */
  extraTypes?: { typeName: string; typeFile: string }[];
  generic: boolean;
  exclude: string[];
  notModels: string[];
};

const TARGETS: Target[] = [
  {
    out: 'components/InfiniteTable/InfiniteTableInputs.generated.angular.ts',
    className: 'InfiniteTableInputs',
    metaName: 'INFINITE_TABLE_PROPS_META',
    typeName: 'InfiniteTableProps',
    typeFile: 'components/InfiniteTable/types/InfiniteTableProps.ts',
    generic: true,
    // children: content projection; the grid reads its own host for the rest
    exclude: ['children'],
    // the value reported by onRowHeightChange (the measured number) can't
    // replace a bound CSS variable name or function
    notModels: ['rowHeight'],
  },
  {
    out: 'components/DataSource/DataSourceInputs.generated.angular.ts',
    className: 'DataSourceInputs',
    metaName: 'DATA_SOURCE_PROPS_META',
    typeName: 'DataSourceProps',
    typeFile: 'components/DataSource/types.ts',
    extraTypes: [
      {
        typeName: 'TreeDataSourceProps',
        typeFile: 'components/TreeGrid/types/TreeDataSourceProps.ts',
      },
    ],
    generic: true,
    exclude: ['children'],
    // a cursor function can't be replaced by the cursor value it computed
    notModels: ['livePaginationCursor'],
  },
];

const parsedConfig = ts.getParsedCommandLineOfConfigFile(
  path.join(SOURCE, 'tsconfig.angular.json'),
  {},
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    },
  },
);
if (!parsedConfig) {
  throw new Error('Could not read tsconfig.angular.json');
}

const rootFiles = TARGETS.flatMap((target) => [
  path.join(SRC, target.typeFile),
  ...(target.extraTypes ?? []).map((extra) => path.join(SRC, extra.typeFile)),
]);
const program = ts.createProgram(rootFiles, parsedConfig.options);
const checker = program.getTypeChecker();

function getExportedType(file: string, name: string): ts.Type {
  const sourceFile = program.getSourceFile(path.join(SRC, file));
  if (!sourceFile) {
    throw new Error(`Not in the program: ${file}`);
  }
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile)!;
  const symbol = checker
    .getExportsOfModule(moduleSymbol)
    .find((s) => s.name === name);
  if (!symbol) {
    throw new Error(`${file} doesn't export ${name}`);
  }
  return checker.getDeclaredTypeOfSymbol(symbol);
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type PropInfo = {
  name: string;
  symbol: ts.Symbol;
  /** the type in each union member that has the prop (most have one) */
  types: ts.Type[];
  docs: string;
  fromType: string;
};

function propTypeOf(symbol: ts.Symbol): ts.Type {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  const type = declaration
    ? checker.getTypeOfSymbolAtLocation(symbol, declaration)
    : checker.getTypeOfSymbol(symbol);
  return checker.getNonNullableType(type);
}

function docsOf(symbol: ts.Symbol): string {
  const text = ts.displayPartsToString(symbol.getDocumentationComment(checker));
  const tags = symbol
    .getJsDocTags(checker)
    .map((tag) =>
      `@${tag.name}${tag.text ? ' ' + ts.displayPartsToString(tag.text) : ''}`,
    );
  return [text, ...tags].filter(Boolean).join('\n\n');
}

function isPlainBoolean(types: ts.Type[]) {
  return types.every(isPlainBooleanType);
}

function isPlainBooleanType(type: ts.Type) {
  if (type.flags & ts.TypeFlags.Boolean) {
    return true;
  }
  if (type.isUnion()) {
    return type.types.every((t) => t.flags & ts.TypeFlags.BooleanLiteral);
  }
  return false;
}

function functionSignature(type: ts.Type): ts.Signature | null {
  const signatures = type.getCallSignatures();
  return signatures.length && !type.getProperties().length ? signatures[0] : null;
}

/**
 * The call signature of a callback prop - of its first function type when it
 * is a union of function types (eg the single/multi selection callbacks).
 */
function callSignature(types: ts.Type[]): ts.Signature | null {
  const members = types.flatMap((type) => (type.isUnion() ? type.types : [type]));
  const signatures = members.map(functionSignature);
  return signatures.every(Boolean) ? signatures[0] : null;
}

function returnsVoid(signature: ts.Signature) {
  const returnType = checker.getReturnTypeOfSignature(signature);
  const isVoidish = (t: ts.Type) =>
    !!(t.flags & (ts.TypeFlags.Void | ts.TypeFlags.Undefined | ts.TypeFlags.Any));
  return returnType.isUnion()
    ? returnType.types.every(isVoidish)
    : isVoidish(returnType);
}

function paramIsEvent(signature: ts.Signature, index: number) {
  const param = signature.getParameters()[index];
  if (!param) {
    return false;
  }
  const type = checker.getNonNullableType(propTypeOf(param));
  return /^(Mouse|Keyboard|Focus|Pointer)?Event(<.*>)?$/.test(
    checker.typeToString(type),
  );
}

type Member =
  | { kind: 'input'; name: string; prop: PropInfo; boolean: boolean }
  | { kind: 'model'; name: string; prop: PropInfo }
  | {
      kind: 'output';
      name: string;
      prop: PropInfo;
      pack: 'none' | 'first' | 'merge-event';
    }
  | { kind: 'function-input'; name: string; prop: PropInfo };

type Callback =
  | { model: string; fn: boolean }
  | { output: string; pack: 'none' | 'first' | 'merge-event'; fn: boolean };

function collectProps(target: Target): PropInfo[] {
  const props = new Map<string, PropInfo>();
  const types = [
    { typeName: target.typeName, typeFile: target.typeFile },
    ...(target.extraTypes ?? []),
  ];
  for (const { typeName, typeFile } of types) {
    const typeProps = new Map<string, PropInfo>();
    // a union (or an intersection with a union) only has the props common to
    // all its members: walk the members to get the others
    const walk = (type: ts.Type) => {
      if (type.isUnion() || type.isIntersection()) {
        type.types.forEach(walk);
        return;
      }
      for (const symbol of checker.getPropertiesOfType(type)) {
        if (target.exclude.includes(symbol.name)) {
          continue;
        }
        const propType = propTypeOf(symbol);
        if (propType.flags & ts.TypeFlags.Never) {
          continue;
        }
        const existing = typeProps.get(symbol.name);
        if (existing) {
          existing.types.push(propType);
          existing.docs ||= docsOf(symbol);
        } else {
          typeProps.set(symbol.name, {
            name: symbol.name,
            symbol,
            types: [propType],
            docs: docsOf(symbol),
            fromType: typeName,
          });
        }
      }
    };
    walk(getExportedType(typeFile, typeName));
    for (const [name, prop] of typeProps) {
      if (!props.has(name)) {
        props.set(name, prop);
      }
    }
  }
  return [...props.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function planMembers(target: Target, props: PropInfo[]) {
  const keys = new Set(props.map((p) => p.name));
  const members: Member[] = [];
  const callbacks: Record<string, Callback> = {};
  const inputs: string[] = [];
  const models: string[] = [];

  const isModel = (name: string) =>
    keys.has(`on${upperFirst(name)}Change`) && !target.notModels.includes(name);

  for (const prop of props) {
    const { name } = prop;
    const signature = name.startsWith('on') ? callSignature(prop.types) : null;

    if (signature && /^on[A-Z]/.test(name)) {
      const params = signature.getParameters();
      const extraArgs = params.length >= 2 && !paramIsEvent(signature, 1);

      const changeMatch = /^on([A-Z].*)Change$/.exec(name);
      const changedProp = changeMatch ? lowerFirst(changeMatch[1]) : null;

      if (changedProp && keys.has(changedProp) && isModel(changedProp)) {
        callbacks[name] = { model: changedProp, fn: extraArgs };
        if (extraArgs) {
          members.push({ kind: 'function-input', name, prop });
        }
        continue;
      }

      if (!returnsVoid(signature)) {
        members.push({ kind: 'function-input', name, prop });
        inputs.push(name);
        continue;
      }

      const outputName = lowerFirst(name.slice(2));
      const pack =
        params.length === 0
          ? 'none'
          : paramIsEvent(signature, 1) && params.length === 2
          ? 'merge-event'
          : 'first';
      members.push({ kind: 'output', name: outputName, prop, pack });
      callbacks[name] = { output: outputName, pack, fn: extraArgs };
      if (extraArgs) {
        members.push({ kind: 'function-input', name, prop });
      }
      continue;
    }

    if (isModel(name)) {
      members.push({ kind: 'model', name, prop });
      models.push(name);
      continue;
    }

    members.push({
      kind: 'input',
      name,
      prop,
      boolean: isPlainBoolean(prop.types),
    });
    inputs.push(name);
  }

  const names = new Map<string, Member>();
  for (const member of members) {
    const taken = names.get(member.name);
    if (taken) {
      throw new Error(
        `${target.className}: ${member.kind} ${member.name} (from ${member.prop.name}) collides with ${taken.kind} ${taken.name} (from ${taken.prop.name})`,
      );
    }
    names.set(member.name, member);
  }

  return { members, callbacks, inputs, models };
}

function jsDoc(docs: string, indent = '  ') {
  if (!docs) {
    return '';
  }
  const lines = docs.replace(/\*\//g, '*\\/').split('\n');
  return `${indent}/**\n${lines.map((l) => `${indent} *${l ? ' ' + l : ''}`).join('\n')}\n${indent} */\n`;
}

function generate(target: Target) {
  const props = collectProps(target);
  const { members, callbacks, inputs, models } = planMembers(target, props);

  const T = target.generic ? '<T>' : '';
  const outDir = path.dirname(path.join(SRC, target.out));
  const importPath = (file: string) => {
    let rel = path
      .relative(outDir, path.join(SRC, file))
      .replace(/\.tsx?$/, '');
    if (!rel.startsWith('.')) {
      rel = './' + rel;
    }
    return rel;
  };

  const typeImports = [
    { typeName: target.typeName, typeFile: target.typeFile },
    ...(target.extraTypes ?? []),
  ];
  const propsType = `${target.className}Props${T}`;

  const fnParams = (prop: PropInfo, index: number) =>
    `Parameters<NonNullable<${propsType}['${prop.name}']>>[${index}]`;

  const body = members
    .map((member) => {
      const docs = jsDoc(member.prop.docs);
      const propType = `${propsType}['${member.prop.name}']`;
      switch (member.kind) {
        // explicit types: the declarations ngc emits print them as written
        // (printing the inferred types loses type parameters in places)
        case 'input':
          return member.boolean
            ? `${docs}  readonly ${member.name}: InputSignalWithTransform<${propType}, ${propType} | ''> = input<${propType}, ${propType} | ''>(undefined, {\n    transform: booleanInput,\n  });`
            : `${docs}  readonly ${member.name}: InputSignal<${propType}> = input<${propType}>();`;
        case 'function-input':
          return `${docs}  readonly ${member.name}: InputSignal<${propType}> = input<${propType}>();`;
        case 'model':
          return `${docs}  readonly ${member.name}: ModelSignal<${propType}> = model<${propType}>();`;
        case 'output': {
          const payload =
            member.pack === 'none'
              ? 'void'
              : member.pack === 'merge-event'
              ? `${fnParams(member.prop, 0)} & { event: ${fnParams(member.prop, 1)} }`
              : fnParams(member.prop, 0);
          return `${docs}  readonly ${member.name}: OutputEmitterRef<${payload}> = output<${payload}>();`;
        }
      }
    })
    .join('\n\n');

  const merged = (typeName: string) => `MergeUnion<${typeName}${T}>`;
  const extraTypeAlias = `\n/**\n * The props the members below are generated from, as one object type.\n */\nexport type ${target.className}Props${T} = ${[
    merged(target.typeName),
    ...(target.extraTypes ?? []).map(
      (extra) => `Omit<${merged(extra.typeName)}, keyof ${merged(target.typeName)}>`,
    ),
  ].join(' &\n  ')};\n`;

  const usesBoolean = members.some((m) => m.kind === 'input' && m.boolean);
  const usesModel = members.some((m) => m.kind === 'model');
  const usesOutput = members.some((m) => m.kind === 'output');

  const angularImports = [
    'Directive',
    'input',
    usesModel && 'model',
    usesOutput && 'output',
  ]
    .filter(Boolean)
    .join(', ');
  const angularTypeImports = [
    'InputSignal',
    usesBoolean && 'InputSignalWithTransform',
    usesModel && 'ModelSignal',
    usesOutput && 'OutputEmitterRef',
  ]
    .filter(Boolean)
    .join(', ');

  const source = `// GENERATED by build/generate-angular-inputs.mts from ${typeImports
    .map((t) => t.typeName)
    .join(' and ')} - do not edit.
// Run \`npm run generate:angular-inputs\` after changing the props.
import { ${angularImports} } from '@angular/core';
import type { ${angularTypeImports} } from '@angular/core';

${typeImports
  .map((t) => `import type { ${t.typeName} } from '${importPath(t.typeFile)}';`)
  .join('\n')}
import type { AngularPropsMeta, MergeUnion } from '${importPath('components/hooks/useComponentState/angularPropsMeta.ts')}';
${usesBoolean ? `import { booleanInput } from '${importPath('components/hooks/useComponentState/angularPropsMeta.ts')}';\n` : ''}${extraTypeAlias}
/**
 * The inputs, models and outputs of the component, generated from
 * ${typeImports.map((t) => t.typeName).join(' and ')}.
 */
@Directive()
export abstract class ${target.className}${T} {
${body}
}

/**
 * How the members above map back to the shared props (see
 * useManagedComponent.angular.ts).
 */
export const ${target.metaName}: AngularPropsMeta = {
  inputs: ${JSON.stringify(inputs, null, 2).replace(/\n/g, '\n  ')},
  models: ${JSON.stringify(models, null, 2).replace(/\n/g, '\n  ')},
  callbacks: ${JSON.stringify(callbacks, null, 2).replace(/\n/g, '\n  ')},
};
`;

  const names: Record<string, { angularName: string; kind: string }[]> = {};
  for (const member of members) {
    (names[member.prop.name] ??= []).push({
      angularName: member.name,
      kind: member.kind,
    });
  }
  for (const [callback, info] of Object.entries(callbacks)) {
    if ('model' in info) {
      (names[callback] ??= []).unshift({
        angularName: `${info.model}Change`,
        kind: 'model-change',
      });
    }
  }

  return { file: path.join(SRC, target.out), source, names };
}

async function format(file: string, source: string) {
  try {
    const prettier = await import('prettier');
    const options = (await prettier.resolveConfig(file)) ?? {};
    return await prettier.format(source, { ...options, filepath: file });
  } catch {
    return source;
  }
}

const outputs: { file: string; source: string }[] = [];
const nameMap: Record<string, unknown> = {};

for (const target of TARGETS) {
  const { file, source, names } = generate(target);
  outputs.push({ file, source: await format(file, source) });
  nameMap[target.typeName.replace(/Props$/, '')] = names;
}

const namesFile = path.join(SOURCE, 'angular-props.generated.json');
outputs.push({
  file: namesFile,
  source: JSON.stringify(nameMap, null, 2) + '\n',
});

let stale = 0;
for (const { file, source } of outputs) {
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (current === source) {
    continue;
  }
  if (CHECK) {
    stale++;
    console.error(`stale: ${path.relative(SOURCE, file)}`);
  } else {
    fs.writeFileSync(file, source);
    console.log(`wrote ${path.relative(SOURCE, file)}`);
  }
}

if (CHECK && stale) {
  console.error(
    'The Angular inputs are out of date: run `npm run generate:angular-inputs` in source/',
  );
  process.exit(1);
}
if (CHECK) {
  console.log('The Angular inputs are up to date.');
}
