const axios = require('axios');
const busboy = require('busboy');

const headers = {
  'Access-Control-Allow-Origin': '*', // Allow from anywhere
  'Access-Control-Allow-Headers': '*',
};

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

// function getLicenseStartDate(licenseKey) {
//   return licenseKey
//     .split('|')
//     .filter((x) => x.startsWith('StartDate'))[0]
//     .split('=')[1];
// }

async function getLicense({ owner, count, ref, startDate, endDate }) {
  const {
    getInfiniteTableLicense,
  } = require('@adaptabletools/infinite-license/bin/infinite-init');

  const keyString = [
    '-f',
    '-o=' + owner,
    '-y=universal',
    '--count=' + count,
    ref ? '-r=' + ref : '',
    startDate ? '-s=' + startDate : '',
    endDate ? '-e=' + endDate : '',
  ].filter(Boolean);

  console.log('key string', keyString);
  console.log('Airtable api key', process.env.AIRTABLE_API_KEY);
  const licenseKey = await getInfiniteTableLicense(keyString);

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

  if (fields.alert_name !== 'subscription_payment_succeeded') {
    return {
      headers,
      statusCode: 200,
      body: `Not a subscription_payment_succeeded alert: ${fields.alert_name}`,
    };
  }

  const { email, passthrough } = fields;

  console.log('passthrough is', passthrough);
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

  try {
    console.log(
      'posting to: ',
      `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
    );
    const body = {
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
    };

    console.log('sending body', body);

    await axios.post(
      `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
      body,
    );

    return {
      headers,
      statusCode: 200,
      body: JSON.stringify(fields),
    };
  } catch (error) {
    console.log('got error', error);
    return {
      headers,
      statusCode: 200,
      body: `ConvertKit error: ${error}`,
    };
  }
};
