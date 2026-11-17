import { checkLicense, decode } from './decode';

// a genuine license key, which expired on 2026-11-04 - its Ref field is
// base64, so it contains `=` (padding)
const EXPIRED_LICENSE_KEY =
  'AppName=ExpiredTest-Universal|Owner=ExpiredTest|StartDate=2026-01-01|EndDate=2026-11-04|Ref=AdaptableLicense-InfiniteTable:T3duZXI9RXhwaXJlZFRlc3R8U3RhcnREYXRlPTIwMjYtMDEtMDF8RW5kRGF0ZT0yMDI2LTExLTA0fERldkNvdW50PTF8VHlwZT11bml2ZXJzYWx8UmVmPUFkYXB0YWJsZUluZmluaXRlfFRTPTE3OTQ5MjQ5NzYyNDl8Qz0zMDU1Njc2NDAzLDMwOTkwMzUxOTksMzE5MzQ4ODQ4MiwyNzYzNTg1MjQ5LDIyMTIyOTQ1ODMsMjA3OTU4MzEwLDEwOTc4NTM5NzcsNzYxNjgwMA==|TS=1794924973187|C=3060863176,3324160607,2998443810,207958310,1097853977,7616800,2092722889';

const noop = () => {};

describe('license decode', () => {
  it('decodes a key whose field values contain "="', () => {
    const details = decode(EXPIRED_LICENSE_KEY);

    expect(details.owner).toBe('ExpiredTest');
    expect(details.end.toISOString()).toBe('2026-11-04T00:00:00.000Z');
    expect(details.ref.endsWith('==')).toBe(true);
  });

  it('reports a genuine key that ended before the version was published as expired', () => {
    expect(
      checkLicense(
        EXPIRED_LICENSE_KEY,
        { publishedAt: Date.UTC(2026, 10, 17), version: 'test' },
        noop,
      ),
    ).toBe('expired');
  });

  it('reports the same key as valid for a version published before it ended', () => {
    expect(
      checkLicense(
        EXPIRED_LICENSE_KEY,
        { publishedAt: Date.UTC(2026, 5, 1), version: 'test' },
        noop,
      ),
    ).toBe('valid');
  });

  it('reports a tampered key as invalid', () => {
    expect(
      checkLicense(
        EXPIRED_LICENSE_KEY.replace('EndDate=2026-11-04', 'EndDate=2099-11-04'),
        { publishedAt: Date.UTC(2026, 10, 17), version: 'test' },
        noop,
      ),
    ).toBe('invalid');
    expect(
      checkLicense('<INVALID>', { publishedAt: 0, version: 'test' }, noop),
    ).toBe('invalid');
  });
});
