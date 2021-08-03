const { compileProgram } = require("../src/ts-compiler-bundle-large");
//import * as React from 'react';

// const { compileFile } = require("./ts-compiler/compileFile");

const code = `
import * as React from 'react'
import {
  InfiniteTableFactory,
  DataSource,
} from "@infinite-table/infinite-react";

type Person = {
  Id: number;
  FirstName: string;
  Age: number;
};
const data: Person[] = [
  {
    Id: 1,
    FirstName: "Bob",
    Age: 3,
  },
  {
    Id: 2,
    FirstName: "Alice",
    Age: 50,
  },
  {
    Id: 3,
    FirstName: "Bill",
    Age: 5,
  },
];
const Table = InfiniteTableFactory<Person>()
`;

const result = compileProgram(code);

console.log();
console.log(result);
if (result.errors.length) {
  throw "Has errors " + result.errors.length;
}
