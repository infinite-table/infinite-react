const fs = require('fs');
const path = require('path');
const carsales = require('../../examples/src/datasets/carsales.json');

carsales.forEach((sale, index) => {
  sale.id = index;
});

fs.writeFileSync(
  path.resolve(__dirname, '../../examples/src/datasets/carsales.json'),
  JSON.stringify(carsales, null, 2),
  'utf8',
);
