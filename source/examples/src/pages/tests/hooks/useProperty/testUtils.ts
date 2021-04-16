type FnCall = {
  args: any[];
};

export const getFnCalls = (fnName: string) => async (): Promise<FnCall[]> => {
  return await page.evaluate((name: string) => {
    return (window as any)[name].getCalls().map((c: any) => {
      return {
        args: c.args as any[],
      };
    });
  }, fnName);
};
