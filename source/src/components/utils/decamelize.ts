// TODO replace this with our own implementation
import decamelizeString from 'decamelize';
export const decamelize = (input: string, options?: { separator: string }) => {
  return decamelizeString(input, { separator: options?.separator ?? '-' });
};
