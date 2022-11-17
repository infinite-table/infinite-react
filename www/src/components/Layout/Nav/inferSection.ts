export function inferSection(pathname: string): 'learn' | 'reference' | 'home' {
  const [docs, v, sectionName] = pathname.split('/');

  console.log({ sectionName, v, docs });
  if (docs === 'blog') {
    return 'home';
  }
  if (docs === '404') {
    return 'learn';
  }
  if (sectionName === 'learn') {
    return 'learn';
  } else if (sectionName === 'reference') {
    return 'reference';
  } else {
    return 'home';
  }
}
