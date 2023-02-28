export function inferSection(
  pathname: string,
): 'learn' | 'reference' | 'releases' {
  const [docs, _v, sectionName] = pathname.split('/');

  if (docs === '404') {
    return 'learn';
  }
  if (sectionName === 'learn') {
    return 'learn';
  } else if (sectionName === 'reference') {
    return 'reference';
  } else if (sectionName === 'releases') {
    return 'releases';
  } else {
    return 'learn';
  }
}
