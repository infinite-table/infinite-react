// const { resolve } = require('path');
// const fs = require('fs');

exports.handler = async function (event, context) {
  async function getLicense(owner, count, ref) {
    const {
      getInfiniteTableLicense,
    } = require('@adaptabletools/infinite-license/bin/adaptable-init');

    const licenseKey = await getInfiniteTableLicense(
      '-o ' + owner + ' -y universal -c' + count + (ref ? ' -r ' + ref : ''),
    );
    return licenseKey;
  }

  function getLicenseExpiryDate(licenseKey) {
    return licenseKey
      .split('|')
      .filter((x) => x.startsWith('EndDate'))[0]
      .split('=')[1];
  }

  const body = JSON.parse(event.body);

  if (!body.action || body.secret !== process.env.NEXT_PUBLIC_SECURITY_CHECK) {
    console.error('Invalid request');
    return {
      statusCode: 200,
      body: 'not found',
    };
  }

  const { owner, count, email, ref, action } = body;

  let LicenseKey = '';

  try {
    LicenseKey = await getLicense(owner, count, ref);
  } catch (error) {
    console.error(error);
    return {
      statusCode: 200,
      body: `License generation error: ${error}`,
    };
  }

  if (action === 'save' || !email) {
    // we generated a license, and the command also stored it to airtable
    // so we can exit
    return {
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
    statusCode: 200,
    body: `All good: ${JSON.stringify(details)}`,
  };
};
