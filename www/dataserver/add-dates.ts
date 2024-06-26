#!/usr/bin/env node

import { getRandomDate } from './developers-generator';

const fs = require('fs');
const path = require('path');

const log = console.log;
import { Command } from 'commander';

function init() {
  const program = new Command();

  program.requiredOption('-f, --file <string>', 'file name');

  program.parse(process.argv);
  const options = program.opts();
  log('');
  log(options);

  const filePath = path.resolve(process.cwd(), options.file as string);
  console.log(filePath);
  const contents = fs.readFileSync(filePath, 'utf8');

  const obj = JSON.parse(contents);

  const arr = obj.developers || obj.employees;

  arr.forEach((item: any) => {
    item.birthDate = getRandomDate(-50, -20);
    item.hireDate = getRandomDate(-5, -1, true);
  });

  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

init();
