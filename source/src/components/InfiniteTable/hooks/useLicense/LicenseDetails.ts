export type LicenseDetails = {
  start: Date;
  end: Date;
  owner: string;
  distribution: boolean;
  trial: boolean;
  skipAirtable?: boolean;
  type: string;
  count?: number;
  timestamp?: number;

  ref: string;
};
