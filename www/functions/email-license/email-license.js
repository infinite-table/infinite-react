// const { resolve } = require('path');
// const fs = require('fs');

const headers = {
  'Access-Control-Allow-Origin': '*', // Allow from anywhere
  'Access-Control-Allow-Headers': '*',
};
const axios = require('axios');

function getLicenseExpiryDate(licenseKey) {
  return licenseKey
    .split('|')
    .filter((x) => x.startsWith('EndDate'))[0]
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

  const body = JSON.parse(event.body);

  if (!body.action || body.secret !== process.env.NEXT_PUBLIC_SECURITY_CHECK) {
    console.error('Invalid request');
    return {
      headers,
      statusCode: 200,
      body: 'not found',
    };
  }

  const { owner, count, email, ref, action, startDate, endDate } = body;

  console.log('got body', body);

  let LicenseKey = '';

  try {
    LicenseKey = await getLicense({ owner, count, ref, startDate, endDate });
    console.log('got the license', LicenseKey);
  } catch (error) {
    console.error(error);
    return {
      statusCode: 200,
      body: `License generation error: ${error}`,
    };
  }

  console.log('license', LicenseKey);

  if (action === 'save' || !email) {
    // we generated a license, and the command also stored it to airtable
    // so we can exit
    return {
      headers,
      statusCode: 200,
      body: `License key was saved to airtable!`,
    };
  }

  const ExpiryDate = getLicenseExpiryDate(LicenseKey);

  const details = {
    owner,
    count,
    email,
    ref,
    date: ExpiryDate,
  };

  console.log(
    'posting to: ',
    `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
  );
  const postbody = {
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

  console.log('sending to convertkit', postbody);

  await axios.post(
    `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
    postbody,
  );

  return {
    headers,
    statusCode: 200,
    body: `All good: ${JSON.stringify(details)}`,
  };
};
