#!/usr/bin/env node

import { getRandomFrom, getRandomInt } from './developers-generator';

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

  const isDevelopers = contents.includes('developers');
  const obj = JSON.parse(contents);

  const arr = obj.developers || obj.employees;

  arr.forEach((item: any) => {
    item.monthlyBonus = getRandomFrom([
      1000, 1500, 2000, 3000, 10000, 1000, 1500, 2000, 3000, 0,
    ]);

    if (isDevelopers) {
      item.weeklyRepoChange = getRandomInt(-3, 5);
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

init();
