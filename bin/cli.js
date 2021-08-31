#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// generator.ts
var import_faker = __toModule(require("faker"));
var fs = require("fs");
var path = require("path");
function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * (max + 1));
}
function getRandomFrom(array) {
  return getRandomInt(0, array.length - 1);
}
var availableCompanies = [...Array(20)].map(() => import_faker.default.company.companyName);
var generate = (size) => {
  return [...Array(size)].map((_, _index) => {
    return {
      company: getRandomFrom(availableCompanies)
    };
  });
};

// cli.ts
var log = console.log;
function init() {
  return __async(this, null, function* () {
    var argv = require("yargs/yargs")(process.argv.slice(2)).usage("Usage: generate [options]").command({ command: "generate", desc: "Generates json dataset" }).example("$0 generate -o outputfile", "generates to that file").option("o", {
      alias: "outfile",
      type: "string",
      describe: "The output file to write to",
      demandOption: true,
      default: false,
      nargs: 1
    }).option("c", {
      alias: "count",
      type: "number",
      describe: "The count or size of the array to generate",
      demandOption: true,
      default: false,
      nargs: 1
    }).help("h").alias("h", "help").epilog("Copyright Infinite Table 2021").argv;
    log("");
    log(write(generate(argv.count), argv.outfile));
  });
}
init();
