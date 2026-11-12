/*
 * Runs before first paint (plain script in <head>): picks the color mode and
 * the page to show, so nothing flashes.
 *   ?theme=light|dark   ?page=home|docs   ?bar=0 (hide the prototype bar)
 *   ?accent=ember|ion   (direction D only: its two accent palettes)
 */
(function () {
  var el = document.documentElement;
  var params = new URLSearchParams(location.search);
  var theme = params.get('theme');
  try {
    if (theme !== 'light' && theme !== 'dark') {
      theme = localStorage.getItem('it-redesign-theme');
    }
  } catch (e) {}
  if (theme !== 'light' && theme !== 'dark') {
    theme =
      window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  }
  el.setAttribute('data-theme', theme);
  el.setAttribute('data-page', params.get('page') === 'docs' ? 'docs' : 'home');
  el.setAttribute('data-framework', 'react');
  var accent = params.get('accent');
  try {
    if (accent !== 'ember' && accent !== 'ion') {
      accent = localStorage.getItem('it-redesign-accent');
    }
  } catch (e) {}
  el.setAttribute('data-accent', accent === 'ion' ? 'ion' : 'ember');
  if (params.get('bar') === '0') el.setAttribute('data-no-bar', '');
})();
