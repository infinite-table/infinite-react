#!/usr/bin/env node

import { generate, write } from './generator';
import { generate as generateDevs } from './developers-generator';

const log = console.log;
import { Command } from 'commander';
import commander from 'commander';

function validateCount(value: string) {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new commander.InvalidArgumentError(
      'Not a number.'
    );
  }
  return parsedValue;
}

function validateOutfile(value: string) {
  if (!value) {
    throw new commander.InvalidArgumentError(
      'Not a valid outfile name.'
    );
  }

  return value.endsWith('.json') ? value : `${value}.json`;
}
function init() {
  const program = new Command();

  program
    .requiredOption(
      '-n, --name <string>',
      'collection name'
    )
    .requiredOption(
      '-o, --outfile <string>',
      'output file',
      validateOutfile
    )
    .requiredOption(
      '-c, --count <type>',
      'count/size of the data to generate',
      validateCount
    );

  program.parse(process.argv);
  const options = program.opts();
  log('');
  log(options);

  const genFn =
    options.name === 'developers' ? generateDevs : generate;

  write(
    { [options.name]: genFn(options.count as number) },
    options.outfile as string
  );
  write(
    { [options.name]: genFn(options.count as number) },
    options.outfile as string
  );
}

init();
