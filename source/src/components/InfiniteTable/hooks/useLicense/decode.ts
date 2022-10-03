import { crc32_compute_string } from './crc32';
import { LicenseDetails } from './LicenseDetails';

export const fieldsToLicenseDetails = (
  fields: { name: string; value: string }[],
): LicenseDetails => {
  const fieldsMap = fields.reduce((acc, field) => {
    acc.set(field.name, field.value);
    return acc;
  }, new Map<string, string>());

  const details: LicenseDetails = {
    distribution: fieldsMap.get('Type') === 'distribution',
    count: fieldsMap.get('DevCount') ? Number(fieldsMap.get('DevCount')) : 0,
    start: new Date(fieldsMap.get('StartDate')!),
    end: new Date(fieldsMap.get('EndDate')!),
    owner: fieldsMap.get('Owner')!,
    type: fieldsMap.get('Type')!,
    timestamp: fieldsMap.get('TS') ? Number(fieldsMap.get('TS')) : 0,
    trial: fieldsMap.get('Trial') === 'true' ? true : false,
    ref: fieldsMap.get('Ref') ?? '',
  };

  return details;
};

export const logLicenseError = (
  lines: string[],
  fn: (...line: string[]) => void = console.error.bind(console),
) => {
  lines = ['* * * infinite-table.com * * *', ...lines];
  const max = Math.max(Math.max(...lines.map((l) => l.length)) + 4 * 2, 60); // 4 extra characters on each line, 3 stars and 1 space

  lines.forEach((line) => {
    let sideCount = (max - line.length) / 2 - 1; // there's 1 extra space on each side
    let offset = 0;

    if (sideCount !== Math.round(sideCount)) {
      offset = -1;
      sideCount = Math.round(sideCount);
    }
    const start = sideCount + offset;
    const end = sideCount;

    fn('*'.repeat(start) + ' ' + line + ' ' + '*'.repeat(end));
  });

  fn('*'.repeat(max));
};

export const isValidLicense = (
  licenseKey: string = '',
  packageInfo: { publishedAt: number; version: string },
  fn?: (...args: string[]) => void,
) => {
  let details: LicenseDetails;

  try {
    details = decode(licenseKey);
  } catch (ex) {
    logLicenseError(
      [
        `You don't have a valid Infinite Table license`,
        'Please visit infinite-table.com to purchase a license.',
        'Thank you for playing fair!',
      ],
      fn,
    );
    return false;
  }

  const currentVersionReleaseDate = new Date(packageInfo.publishedAt);
  const licenseEndDate = new Date(details.end);

  if (licenseEndDate < currentVersionReleaseDate) {
    logLicenseError(
      [
        `
Your Infinite Table license has expired on ${licenseEndDate.toDateString()}.
`,
        `You are using version "${
          packageInfo.version
        }" of Infinite Table, which was published on ${currentVersionReleaseDate.toDateString()}.`,
        `Please visit infinite-table.com to renew your license.`,
        `Thank you for playing fair!`,
      ],
      fn,
    );

    return false;
  }

  return true;
};

export const decode = (licenseKey: string): LicenseDetails => {
  let crc: string = '';
  let fields = licenseKey.split('|').map((part) => {
    let [name, value] = part.split('=');

    if (name === 'C') {
      crc = value;
    }

    return {
      name,
      value,
    };
  });

  if (!crc) {
    throw 'Invalid license';
  }

  const crcParts = crc.split(',').reverse();

  const overallCrc = crcParts.pop();
  crcParts.forEach((fieldCrc, index) => {
    const field = fields[index];
    if (crc32_compute_string(field.value) !== fieldCrc) {
      throw 'Invalid license';
    }
  });

  const fieldsWithoutC = [...fields];

  fieldsWithoutC.pop();

  const fieldsWithoutCString = fieldsWithoutC
    .map((field) => {
      return `${field.name}=${field.value}`;
    })
    .join('|');

  if (crc32_compute_string(fieldsWithoutCString) !== overallCrc) {
    throw 'Invalid license';
  }

  fields = fields.map((f) => {
    return {
      ...f,
      value: decodeURI(f.value),
    };
  });

  return fieldsToLicenseDetails(fields);
};
