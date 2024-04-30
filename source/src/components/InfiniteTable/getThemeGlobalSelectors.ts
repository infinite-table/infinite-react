export function getThemeModeCls(themeMode: 'light' | 'dark') {
  return `infinite-theme-mode--${themeMode}`;
}
export function getThemeNameCls(themeName: string) {
  return `infinite-theme-name--${themeName}`;
}

export function getThemeGlobalSelectors(
  themeName: string,
  themeMode: 'light' | 'dark',
) {
  const modeCls = getThemeModeCls(themeMode);
  const nameCls = getThemeNameCls(themeName);

  return [
    // when explicitly setting the theme and the mode on the same element
    // it should have higher priority than using different elements
    `.${modeCls}.${modeCls}.${nameCls}.${nameCls}`,

    `.${modeCls} .${nameCls}`,
    // this is here to make light mode have higher priority than prefers-color-scheme: dark
    // since we are explicitly setting the theme
    themeMode === 'light' ? `.${modeCls}.${modeCls} .${nameCls}` : '',

    `.${nameCls} .${modeCls}`,
    // this is here to make light mode have higher priority than prefers-color-scheme: dark
    // since we are explicitly setting the theme
    themeMode === 'light' ? `.${nameCls} .${modeCls}.${modeCls}` : '',
  ].filter(Boolean);
}

export function getThemeGlobalSelector(
  themeName: string,
  themeMode: 'light' | 'dark',
) {
  return getThemeGlobalSelectors(themeName, themeMode).join(', ');
}
