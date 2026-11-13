/*
 * Runs before first paint (plain script in <head>): picks the color mode and
 * the page to show, so nothing flashes.
 *   ?theme=light|dark   ?page=home|docs   ?bar=0 (hide the prototype bar)
 *   ?accent=ember|ion   (direction D only: its two accent palettes)
 *   ?type=fraunces|newsreader|sans|instrument   (direction C only: its display face)
 *   ?palette=amber|signal|cobalt|violet|magenta|original   (A2 only: its accent)
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
  var TYPES = ['fraunces', 'newsreader', 'sans', 'instrument'];
  var type = params.get('type');
  try {
    if (TYPES.indexOf(type) < 0) type = localStorage.getItem('it-redesign-type');
  } catch (e) {}
  el.setAttribute('data-type', TYPES.indexOf(type) < 0 ? 'fraunces' : type);
  var PALETTES = ['amber', 'signal', 'cobalt', 'violet', 'magenta', 'original'];
  var palette = params.get('palette');
  try {
    if (PALETTES.indexOf(palette) < 0) palette = localStorage.getItem('it-redesign-palette');
  } catch (e) {}
  el.setAttribute('data-palette', PALETTES.indexOf(palette) < 0 ? 'amber' : palette);
  if (params.get('bar') === '0') el.setAttribute('data-no-bar', '');
})();
