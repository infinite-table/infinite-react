import { checkLicense } from './decode';

/**
 * - `valid` - the license key is valid (or the grid does not need one)
 * - `missing` - no license key was given
 * - `invalid` - a license key was given, but it is not a valid key
 * - `expired` - a genuine license key, which expired before this version was published
 *
 * `missing` and `expired` show the "Powered by Infinite Table" footer,
 * `invalid` shows the (red) invalid license footer.
 */
export type LicenseStatus = 'valid' | 'missing' | 'invalid' | 'expired';

/**
 * Framework-agnostic license check, shared by the React and Vue grids.
 * Logs the details to the console when the license is not valid.
 */
export function getLicenseStatus(
  licenseKey: string = '',
  options: { isDetail: boolean },
): LicenseStatus {
  if (options.isDetail) {
    // detail grids are covered by the license of the master grid
    return 'valid';
  }

  const result = checkLicense(licenseKey, {
    publishedAt: __VERSION_TIMESTAMP__,
    version: __VERSION__,
  });

  if (result === 'invalid' && !licenseKey) {
    return 'missing';
  }

  return result;
}
