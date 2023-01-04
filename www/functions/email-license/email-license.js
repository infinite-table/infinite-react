// const { resolve } = require('path');
// const fs = require('fs');

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

async function getLicense(owner, count, ref) {
  const {
    getInfiniteTableLicense,
  } = require('@adaptabletools/infinite-license/bin/infinite-init');

  const licenseKey = await getInfiniteTableLicense(
    ' -f -o=' + owner + ' -y=universal -c=' + count + (ref ? ' -r=' + ref : ''),
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

  const { owner, count, email, ref, action } = body;

  console.log('got body', body);

  let LicenseKey = '';

  try {
    LicenseKey = await getLicense(owner, count, ref);
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
  return {
    headers,
    statusCode: 200,
    body: `All good: ${JSON.stringify(details)}`,
  };
};
