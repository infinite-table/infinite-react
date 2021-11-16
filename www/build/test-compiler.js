const { compileProgram } = require("../src/ts-compiler-bundle-large");
//import * as React from 'react';

// const { compileFile } = require("./ts-compiler/compileFile");

// const code = `
// import * as React from 'react'
// import {
//   InfiniteTable,
//   DataSource,
// } from "@infinite-table/infinite-react";

// import {Person, data} from './data'

// export default function App() {
//   return <DataSource<Person> primaryKey="Id" data={data}>
//   </DataSource>
// }

// `;

const deps = new Map();
// deps.set(
//   "./data",
//   `

// export type Person = {
//   Id: number;
//   FirstName: string;
//   Age: number;
// };
// export const data: Person[] = [
//   {
//     Id: 1,
//     FirstName: "Bob",
//     Age: 3,
//   },
//   {
//     Id: 2,
//     FirstName: "Alice",
//     Age: 50,
//   },
//   {
//     Id: 3,
//     FirstName: "Bill",
//     Age: 5,
//   },
// ];`
// );

const code = `
const a: number = 15;`;
const result = compileProgram(code, "", deps);

// console.log();
console.log(result);
if (result.errors && result.errors.length) {
  // console.log(result.e)
  // throw "Has errors " + result.errors.length;
}
