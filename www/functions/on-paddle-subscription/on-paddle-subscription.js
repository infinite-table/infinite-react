const headers = {
  'Access-Control-Allow-Origin': '*', // Allow from anywhere
  'Access-Control-Allow-Headers': '*',
};

import * as Busboy from 'busboy';

function getLicenseExpiryDate(licenseKey) {
  return licenseKey
    .split('|')
    .filter((x) => x.startsWith('EndDate'))[0]
    .split('=')[1];
}

function parseMultipartForm(event) {
  return new Promise((resolve) => {
    // we'll store all form fields inside of this
    const fields = {};

    // let's instantiate our busboy instance!
    const busboy = new Busboy({
      // it uses request headers
      // to extract the form boundary value (the ----WebKitFormBoundary thing)
      headers: event.headers,
    });

    // whenever busboy comes across a normal field ...
    busboy.on('field', (fieldName, value) => {
      fields[fieldName] = value;
    });

    // once busboy is finished, we resolve the promise with the resulted fields.
    busboy.on('finish', () => {
      resolve(fields);
    });

    busboy.write(event.body);
  });
}

async function getLicense({ owner, count, ref, startDate, endDate }) {
  const {
    getInfiniteTableLicense,
  } = require('@adaptabletools/infinite-license/bin/infinite-init');

  const licenseKey = await getInfiniteTableLicense(
    ' -f -o=' +
      owner +
      ' -y=universal -c=' +
      count +
      (ref ? ' -r=' + ref : '') +
      (startDate ? ' -s=' + startDate : '') +
      (endDate ? ' -e=' + endDate : ''),
  );
  return licenseKey;
}

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
    };
  }

  const fields = await parseMultipartForm(event);

  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(fields),
  };
};
