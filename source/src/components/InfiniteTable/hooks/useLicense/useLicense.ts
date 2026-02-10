import { useMemo } from 'react';

import { isValidLicense } from './decode';
import { useDataSourceMasterRowInfo } from '../../../DataSource/publicHooks/useDataSourceMasterDetailSelector';

const SANDPACK_REGEX =
  /(https):\/\/\d+\-\d+\-\d+\-(sandpack\.codesandbox\.io)/g;
const SANDBOX_REGEX = /(https):\/\/\S+(\.csb\.app)/g;

const origin = typeof window !== 'undefined' ? window.location.origin : '';

const isInsideSandpack = () => {
  const [_fullUrl, protocol, sandpackUrl] = Array.from(
    SANDPACK_REGEX.exec(origin) || [],
  );
  return protocol === 'https' && sandpackUrl === 'sandpack.codesandbox.io';
};
const isInsideSandbox = () => {
  const [_fullUrl, protocol, sandboxUrl] = Array.from(
    SANDBOX_REGEX.exec(origin) || [],
  );
  return protocol === 'https' && sandboxUrl === '.csb.app';
};

const isInsidePlayground = isInsideSandbox() || isInsideSandpack();

export const useLicense = (licenseKey: string = '') => {
  const masterRowInfo = useDataSourceMasterRowInfo();
  const isDetail = !!masterRowInfo;

  const valid = useMemo(() => {
    if (isDetail) {
      return true;
    }
    let valid = isValidLicense(licenseKey, {
      publishedAt: __VERSION_TIMESTAMP__,
      version: __VERSION__,
    });

    if (!licenseKey && !valid && isInsidePlayground) {
      return true;
    }

    return valid;
  }, [licenseKey, isDetail]);
  return valid;
};
