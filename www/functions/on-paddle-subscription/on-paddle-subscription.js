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

function getLicenseExpiryDate(licenseKey) {
  return licenseKey
    .split('|')
    .filter((x) => x.startsWith('EndDate'))[0]
    .split('=')[1];
}

function getLicenseStartDate(licenseKey) {
  return licenseKey
    .split('|')
    .filter((x) => x.startsWith('StartDate'))[0]
    .split('=')[1];
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
  console.log('Airtable api key', process.env.AIRTABLE_API_KEY);
  console.log('generated license key', licenseKey);
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

  if (fields.alert_name !== 'payment_succeeded') {
    return {
      headers,
      statusCode: 200,
      body: `Not a payment_succeeded alert: ${fields.alert_name}`,
    };
  }

  const { email, passthrough } = fields;

  const { owner, count } = JSON.parse(passthrough);

  console.log(fields);
  console.log({ owner, count });

  let LicenseKey = '';

  try {
    LicenseKey = await getLicense({ owner, count });
    console.log('got the license', LicenseKey);
  } catch (error) {
    console.error(error);
    return {
      statusCode: 200,
      body: `License generation error: ${error}`,
    };
  }

  const ExpiryDate = getLicenseExpiryDate(LicenseKey);

  const response = await fetch(
    `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.CONVERTKIT_API_KEY,
        email,
        // this is the ID of the "client" tag in ConvertKit
        tags: [process.env.CONVERTKIT_TAG_ID],
        fields: {
          license_key: LicenseKey,
          license_count: count,
          expiry_date: ExpiryDate,
          purchase_timestamp: new Date().toISOString(),
        },
      }),
    },
  );

  if (response.ok) {
    return {
      headers,
      statusCode: 200,
      body: JSON.stringify(fields),
    };
  }

  return {
    headers,
    statusCode: response.status,
    body: response.statusText,
  };
};
