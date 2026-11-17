import { useMemo } from 'react';

import { getLicenseStatus } from './getLicenseStatus';
import { useMasterRowInfo } from '../../../DataSource/publicHooks/useDataSourceMasterDetailSelector';

export const useLicense = (licenseKey: string = '') => {
  const masterRowInfo = useMasterRowInfo();
  const isDetail = !!masterRowInfo;

  return useMemo(
    () => getLicenseStatus(licenseKey, { isDetail }),
    [licenseKey, isDetail],
  );
};
