const fs = require('fs');
const path = require('path');
const carsales = require('../../examples/src/datasets/carsales.json');

function getRandomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const color = [
  'white',
  'white',
  'white',
  'black',
  'yellow',
  'white',
  'black',
  'blue',
  'blue',
  'blue',
  'green',
  'red',
  'red',
  'magenta',
  'silver',
  'silver',
];

carsales.forEach((sale, index) => {
  // sale.id = index;
  sale.color = color[getRandomNumberBetween(0, color.length - 1)];
});

fs.writeFileSync(
  path.resolve(__dirname, '../../examples/src/datasets/carsales.json'),
  JSON.stringify(carsales, null, 2),
  'utf8',
);
