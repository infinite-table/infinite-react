import { useMemo } from 'react';
import { isValidLicense } from './decode';

const SANDBOX_REGEX = /(https):\/\/\d+\-\d+\-\d\-(sandpack\.codesandbox\.io)/g;

const origin = typeof window !== 'undefined' ? window.location.origin : '';
const [_fullUrl, protocol, sandboxUrl] = Array.from(
  SANDBOX_REGEX.exec(origin) || [],
);

const isInsideSandbox =
  protocol === 'https' && sandboxUrl === 'sandpack.codesandbox.io';

export const useLicense = (licenseKey: string) => {
  const valid = useMemo(() => {
    let valid = isValidLicense(licenseKey, {
      publishedAt: __VERSION_TIMESTAMP__,
      version: __VERSION__,
    });

    if (!valid && isInsideSandbox) {
      return true;
    }

    return valid;
  }, [licenseKey]);
  return valid;
};
