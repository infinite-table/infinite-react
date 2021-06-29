import { useMemo } from 'react';
import { isValidLicense } from './decode';

export const useLicense = (licenseKey: string) => {
  const valid = useMemo(() => {
    return isValidLicense(licenseKey, {
      publishedAt: __VERSION_TIMESTAMP__,
      version: __VERSION__,
    });
  }, [licenseKey]);
  return valid;
};
