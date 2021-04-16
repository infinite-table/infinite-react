export const toUpperFirst = (s: string): string => {
  return s ? s.substr(0, 1).toUpperCase() + s.substr(1) : s;
};

export default toUpperFirst;
