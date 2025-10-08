import path from 'node:path';
import fs from 'node:fs';
import rangeParser from 'parse-numeric-range';

import {
  MarkdownFileEnv,
  MarkdownFileInfo,
  SnippetMetaProps,
} from './MarkdownFileInfo';
import { extractImports } from './extractTSImports';

const dirname = path.resolve('..');

// TODO read this from some configuration option/file
const ROOT_DOCS_PAGES = path.resolve(dirname, 'www/content/docs');
const DOCS_ENV_VAR = '$DOCS';

const HIGHLIGHT_REGEX = /{([\d,-]+)}/;
/**
 *
 * @param metastring string provided after the language in a markdown block
 * @returns array of lines to highlight
 * @example
 * ```js {1-3,7} [[1, 1, 20, 33], [2, 4, 4, 8]] App.js active
 * ...
 * ```
 *
 * -> The metastring is `{1-3,7} [[1, 1, 20, 33], [2, 4, 4, 8]] App.js active`
 */
function getHighlightLines(metastring: string): number[] {
  const parsedMetastring = HIGHLIGHT_REGEX.exec(metastring);
  if (!parsedMetastring) {
    return [];
  }
  return rangeParser(parsedMetastring[1]);
}

const getFileAbsolutePath = (
  fileRelativePath: string,
  requestingFile: MarkdownFileInfo,
) => {
  let result = '';

  result = path.resolve(
    requestingFile.fileAbsolutePath,
    '../',
    fileRelativePath,
  );
  return result;
};

function readFileContents(
  fileRelativePath: string,
  requestingFileInfo: MarkdownFileInfo,
  env: MarkdownFileEnv = {},
) {
  if (fileRelativePath.startsWith(DOCS_ENV_VAR)) {
    fileRelativePath = fileRelativePath.replace(`${DOCS_ENV_VAR}/`, '');
    fileRelativePath = path.resolve(ROOT_DOCS_PAGES, fileRelativePath);
  }

  const fileAbsolutePath = getFileAbsolutePath(
    fileRelativePath,
    requestingFileInfo,
  );

  if (!fs.existsSync(fileAbsolutePath)) {
    const errMessage = `Invalid file location for code snippet; no such file "${fileAbsolutePath}" (required by ${requestingFileInfo.fileAbsolutePath})`;
    console.error(
      `\n\n ! ------------------------------- ! \n\n ${errMessage}\n\n ! ------------------------------- ! \n\n`,
    );

    throw Error(errMessage);
  }

  let fileContent = fs.readFileSync(fileAbsolutePath, 'utf8').trim();

  if (fileContent) {
    fileContent = fileContent.replace(
      /process.env\.NEXT_PUBLIC_BASE_URL/g,
      `'${env.NEXT_PUBLIC_BASE_URL}'`,
    );
  }

  return fileContent;
}

function getPropsFromMeta(meta: string): SnippetMetaProps {
  const highlightLines = getHighlightLines(meta);
  if (highlightLines.length) {
    meta = meta.replace(HIGHLIGHT_REGEX, '');
  }

  const metaBlocks = meta.match(/(?:[^\s"]+|"[^"]*")+/g);

  const otherMeta = (metaBlocks || []).reduce((acc, block) => {
    let [key, value] = block.split('=');
    if (value && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    acc[key] = value;

    if (!value) {
      acc[key] = true;
    }

    return acc;
  }, {} as Record<string, boolean | string>);

  return {
    highlightLines,
    code: '',
    live: false,
    inline: !otherMeta.file,
    files: [],
    ...otherMeta,
    importedPackages: [],
  };
}

/**
 * Extracts import statements from code and returns an array of root package names
 * @param {string} code - The source code to analyze
 * @returns {string[]} Array of root package names
 */
function getImportedPackages(code: string): string[] {
  const imports = extractImports(code);
  const result = imports.map((x) => {
    // Extract root package name (everything before the first slash after @ or the first slash)
    const module = x.module;

    // Handle scoped packages (starting with @)
    if (module.startsWith('@')) {
      const parts = module.split('/');
      // For scoped packages, take the first two parts (@scope/package)
      return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : module;
    }

    // Handle regular packages (take everything before the first slash)
    const firstSlashIndex = module.indexOf('/');
    return firstSlashIndex > 0 ? module.substring(0, firstSlashIndex) : module;
  });

  return Array.from(new Set(result)).filter((x) => x !== '.' && x !== '..');
}

export function getCodeSnippetInfo(
  snippet: { meta: string; body: string | undefined; lang: string },
  requestingFileInfo: MarkdownFileInfo,
  env: MarkdownFileEnv = {},
): SnippetMetaProps {
  const props = getPropsFromMeta(snippet.meta);

  if (snippet.lang) {
    props.lang = snippet.lang;
  }

  let code = snippet.body || '';
  let files: { name: string; code: string }[] = [];

  if (props.file && typeof props.file === 'string') {
    code = readFileContents(props.file, requestingFileInfo, env);
  }

  if (code) {
    files = [
      {
        name: 'App.tsx',
        code,
      },
    ];
  }
  props.importedPackages = getImportedPackages(code);

  if (props.files && typeof props.files === 'string') {
    let fileNames: string[] = [];
    try {
      fileNames = JSON.parse(props.files);
    } catch (e) {
      fileNames =
        typeof props.files === 'string'
          ? (props.files as string)
              .split(',')
              .map((x: string) => x.trim())
              .filter(Boolean)
          : [];
    }

    files = fileNames.map((file: string) => {
      return {
        name: file.startsWith('$DOCS') ? file.split('/').pop() || '' : file,
        code: readFileContents(file, requestingFileInfo, env),
      };
    });
    props.importedPackages = [
      ...props.importedPackages,
      ...files.flatMap((x) => getImportedPackages(x.code)),
    ];
  }

  if (props.deps && typeof props.deps === 'string') {
    const deps = props.deps.split(',');
    props.importedPackages = [...props.importedPackages, ...deps];
  }

  props.files = files;

  return props;
}
