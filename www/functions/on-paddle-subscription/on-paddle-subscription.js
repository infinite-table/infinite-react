const headers = {
  'Access-Control-Allow-Origin': '*', // Allow from anywhere
  'Access-Control-Allow-Headers': '*',
};

const busboy = require('busboy');

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
    const bb = busboy({
      // it uses request headers
      // to extract the form boundary value (the ----WebKitFormBoundary thing)
      headers: event.headers,
    });

    // whenever busboy comes across a normal field ...
    bb.on('field', (fieldName, value) => {
      console.log('field', fieldName, value);
      fields[fieldName] = value;
    });
    bb.on('error', (error) => {
      console.log('err', error);
      reject(error);
    });

    // once busboy is finished, we resolve the promise with the resulted fields.
    bb.on('finish', () => {
      resolve(fields);
    });
    bb.write(event.body);
    bb.end();
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

  console.log('webhook invoked');
  const fields = await parseMultipartForm(event);

  console.log(fields);
  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(fields),
  };
};
