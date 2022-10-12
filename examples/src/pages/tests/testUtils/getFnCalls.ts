import { Page } from '@playwright/test';

type FnCall = {
  args: any[];
};

export const getFnCalls = async (fnName: string, { page }: { page: Page }) => {
  const result = await page.evaluate((name: string) => {
    return (window as any)[name].getCalls().map((c: any) => {
      return {
        args: c.args as any[],
      };
    });
  }, fnName);

  return result as Promise<FnCall[]>;
};
