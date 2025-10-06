import * as ts from "typescript";

// // Sample TypeScript code snippet
// const codeSnippet: string = `
// import { useState, useEffect } from 'react';
// import * as fs from 'fs';
// import lodash from 'lodash';
// import express = require('express');
// `;

// Interface to structure the import details
interface ImportDetails {
  module: string;
  namedImports: { name: string; alias: string | null }[];
  defaultImport: string | null;
  namespaceImport: string | null;
}

// Function to extract imports from a TypeScript code snippet
export function extractImports(sourceCode: string): ImportDetails[] {
  // Create a source file from the code snippet
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    "snippet.ts", // File name (arbitrary)
    sourceCode, // Code snippet
    ts.ScriptTarget.ESNext, // Target ECMAScript version
    true // Set parent nodes
  );

  const imports: ImportDetails[] = [];

  // Function to visit each node in the AST
  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      const moduleName: string = node.moduleSpecifier.getText().slice(1, -1); // Remove quotes
      const importDetails: ImportDetails = {
        module: moduleName,
        namedImports: [],
        defaultImport: null,
        namespaceImport: null,
      };

      // Check for named imports, default imports, or namespace imports
      if (node.importClause) {
        // Default import
        if (node.importClause.name) {
          importDetails.defaultImport = node.importClause.name.text;
        }

        // Named imports or namespace import
        if (node.importClause.namedBindings) {
          if (ts.isNamedImports(node.importClause.namedBindings)) {
            importDetails.namedImports =
              node.importClause.namedBindings.elements.map(
                (element: ts.ImportSpecifier) => ({
                  name: element.name.text,
                  alias: element.propertyName
                    ? element.propertyName.text
                    : null,
                })
              );
          } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            importDetails.namespaceImport =
              node.importClause.namedBindings.name.text;
          }
        }
      }

      imports.push(importDetails);
    }

    // Recursively visit all child nodes
    ts.forEachChild(node, visit);
  }

  // Start traversing the AST
  ts.forEachChild(sourceFile, visit);

  return imports;
}

// Extract and log the imports
// const imports: ImportDetails[] = extractImports(codeSnippet);
// console.log(JSON.stringify(imports, null, 2));
