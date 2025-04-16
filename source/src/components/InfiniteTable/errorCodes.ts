import { DebugWarningPayload } from './types/DevTools';

function buildErrorPayload<T_CODE extends keyof typeof ERROR_CODES>(
  code: T_CODE,
  message: string,
  type?: DebugWarningPayload['type'],
): DebugWarningPayload {
  message = message.replaceAll('$ERR_CODE', code);

  message = `${message}

ERROR_CODE = ${code}

See http://infinite-table.com/docs/reference/error-codes#${code} for more info.`;

  return {
    code,
    message,
    type: type ?? 'error',
  };
}

function buildErrors<
  T extends Record<
    string,
    string | { message: string; type: DebugWarningPayload['type'] }
  >,
>(errors: T) {
  return Object.entries(errors).reduce((acc, [key, message]) => {
    const code = key as keyof typeof ERROR_CODES;
    const payload = buildErrorPayload(
      code,
      typeof message === 'string' ? message : message.message,
      typeof message === 'string' ? undefined : message.type,
    );
    // @ts-ignore
    acc[code] = payload;
    return acc;
  }, {} as Record<keyof T, DebugWarningPayload>);
}

function warn(strings: TemplateStringsArray) {
  return {
    message: strings.join(''),
    type: 'warning' as const,
  };
}

function error(strings: TemplateStringsArray) {
  return {
    message: strings.join(''),
    type: 'error' as const,
  };
}

export const DS_ERROR_CODES = buildErrors({
  DS001: warn`The "data" prop of your DataSource seems to be updating too frequently.
Make sure you don't pass a new reference on every render.`,
});

export const INFINITE_ERROR_CODES = buildErrors({
  CSS001_CSS: error`It appears you have not loaded the CSS file for InfiniteTable.
In most environments, you should be able to fix this by adding the following line:
  
import '@infinite-table/infinite-react/index.css'
  `,
});

export const ERROR_CODES = {
  ...DS_ERROR_CODES,
  ...INFINITE_ERROR_CODES,
};
