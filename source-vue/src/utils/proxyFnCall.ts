export function proxyFn<
  T_PARAM_TO_PROXY,
  T_FN_PARAMETERS,
  T_RESULT extends any,
>(
  fn: (...params: T_FN_PARAMETERS[]) => T_RESULT,
  config?: {
    getProxyTargetFromArgs: (...params: T_FN_PARAMETERS[]) => T_PARAM_TO_PROXY;
    putProxyToArgs: (
      proxy: T_PARAM_TO_PROXY,
      ...params: T_FN_PARAMETERS[]
    ) => T_FN_PARAMETERS[];
  },
) {
  const propertyReads: Set<string> = new Set();
  function proxiedFn(...params: T_FN_PARAMETERS[]) {
    const paramToProxy = config
      ? config.getProxyTargetFromArgs(...params)
      : params[0];

    propertyReads.clear();

    const handler = {
      get: function (obj: object, prop: string) {
        propertyReads.add(prop);
        return (obj as any as T_PARAM_TO_PROXY)[prop as keyof T_PARAM_TO_PROXY];
      },
    };
    const proxy = new Proxy(
      paramToProxy as any as object,
      handler,
    ) as any as T_PARAM_TO_PROXY;

    const newParams = config
      ? config.putProxyToArgs(proxy, ...params)
      : [proxy];

    //@ts-ignore
    return fn.apply(this as unknown as any, newParams);
  }

  return {
    fn: proxiedFn,
    propertyReads,
  };
}
